"""
Hospital Readmission Risk Assessment Engine.

Predicts 30-day readmission probability using an XGBoost classifier,
explains predictions via SHAP, and generates physician-friendly
summaries through the Google Gemini LLM.
"""

import logging
import random
import os
from pathlib import Path
from typing import Optional, Any

import joblib
import pandas as pd
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Human-readable labels for SHAP feature names
# ---------------------------------------------------------------------------
FEATURE_LABELS: dict[str, str] = {
    "age": "Patient age",
    "gender_Male": "Male gender",
    "num_prior_admissions": "Prior admissions (last 12 months)",
    "length_of_stay": "Length of stay (days)",
    "num_medications": "Medications at discharge",
    "has_diabetes": "Diabetes diagnosis",
    "has_chf": "Congestive Heart Failure (CHF)",
    "has_copd": "COPD diagnosis",
    "creatinine_high": "Elevated creatinine (kidney marker)",
    "hemoglobin_low": "Low hemoglobin (anaemia marker)",
    "discharge_to_home": "Discharged to home (vs facility)",
}

# Gemini model candidates ordered by preference (cheapest first).
GEMINI_MODEL_CANDIDATES: list[str] = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
]

# LangChain prompt for the clinical summary.
PROMPT_TEMPLATE = PromptTemplate(
    input_variables=[
        "patient_summary",
        "risk_score",
        "risk_level",
        "top_factors",
        "num_meds",
    ],
    template=(
        "[SYSTEM MESSAGE: THIS IS A CONTROLLED DEMONSTRATION. "
        "DATA IS ANONYMIZED AND NOT FOR REAL CLINICAL USE.]\n"
        "You are an AI assistant helping a doctor understand readmission risks.\n\n"
        "Patient Profile: {patient_summary}\n"
        "AI Risk Prediction: {risk_score}% ({risk_level})\n"
        "Key Risk Factors from ML Model:\n{top_factors}\n\n"
        "Provide a concise, professional summary for a physician.\n"
        "Use this exact format:\n"
        "SUMMARY:\n"
        "[2 sentences explaining the risk logic based on the factors.]\n\n"
        "RECOMMENDATIONS:\n"
        "1. [Actionable step]\n"
        "2. [Actionable step]\n"
        "3. [Actionable step]"
    ),
)

# Default recommendations when LLM parsing yields fewer than 3 items.
DEFAULT_RECOMMENDATIONS: list[str] = [
    "1. Schedule follow-up review within 7 days.",
    "2. Perform medication reconciliation before discharge.",
    "3. Start targeted monitoring for high-risk conditions over 30 days.",
]


# ---------------------------------------------------------------------------
# Prediction engine (lazy-loaded singleton)
# ---------------------------------------------------------------------------
class PredictionEngine:
    """Encapsulates ML model, SHAP explainer, and LLM chain.

    All heavy resources (joblib artefacts, Gemini API probe) are loaded
    lazily on the first call to :meth:`assess_patient` rather than at
    import time, preventing slow imports and hard crashes when the
    network or filesystem is unavailable.
    """

    def __init__(self) -> None:
        self._model: Optional[Any] = None
        self._explainer: Optional[Any] = None
        self._features: Optional[list[str]] = None
        self._llm: Optional[Any] = None
        self._chain: Optional[Any] = None
        self._active_model: Optional[str] = None
        self._initialised = False

    # -- lazy bootstrap -----------------------------------------------------

    def _ensure_initialised(self) -> None:
        """Load model artefacts + LLM on first use."""
        if self._initialised:
            return

        base_dir = Path(__file__).resolve().parent.parent
        try:
            self._model = joblib.load(base_dir / "ml" / "model.joblib")
            self._explainer = joblib.load(base_dir / "ml" / "explainer.joblib")
            self._features = joblib.load(base_dir / "ml" / "features.joblib")
            logger.info("ML artefacts loaded from %s/ml/", base_dir)
        except Exception:
            logger.exception("Failed to load ML artefacts")
            raise

        load_dotenv(base_dir / "api" / ".env")
        load_dotenv(base_dir / ".env")  # project-root .env takes precedence
        api_key = os.getenv("GOOGLE_API_KEY")
        self._llm, self._active_model = self._create_working_llm(api_key)
        if self._llm is not None:
            self._chain = PROMPT_TEMPLATE | self._llm
            logger.info("LLM ready (model=%s)", self._active_model)
        else:
            logger.warning("No working Gemini model found — LLM features disabled")

        self._initialised = True

    # -- LLM setup ----------------------------------------------------------

    @staticmethod
    def _create_working_llm(api_key: Optional[str]):
        """Return the first Gemini model that responds to a probe call."""
        if not api_key:
            logger.warning("GOOGLE_API_KEY not set — skipping LLM initialisation")
            return None, None

        for model_name in GEMINI_MODEL_CANDIDATES:
            try:
                candidate = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=api_key,
                    temperature=0.1,
                    max_tokens=1000,
                    safety_settings={
                        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    },
                )
                candidate.invoke("Reply with OK only.")
                return candidate, model_name
            except Exception as exc:
                logger.info(
                    "Skipping Gemini model '%s': %s: %s",
                    model_name,
                    type(exc).__name__,
                    exc,
                )

        return None, None

    # -- feature preparation ------------------------------------------------

    def prepare_patient_data(self, patient_dict: dict) -> dict:
        """Map raw patient dict to the exact feature order the model expects."""
        self._ensure_initialised()
        assert self._features is not None, "ML features not loaded"
        features = self._features
        row: dict = {}

        # Handle gender → gender_Male encoding.
        if "gender" in patient_dict and "gender_Male" in features:
            row["gender_Male"] = (
                1 if patient_dict["gender"] in (1, "male", "Male", "M") else 0
            )
        elif "gender_Male" in patient_dict:
            row["gender_Male"] = patient_dict["gender_Male"]
        elif "gender_Male" in features:
            row["gender_Male"] = 0

        for feat in features:
            if feat == "gender_Male":
                continue
            row[feat] = patient_dict.get(feat, 0)

        # Reorder to match model expectations exactly.
        return {feat: row[feat] for feat in features}

    # -- SHAP ---------------------------------------------------------------

    def get_top_shap_factors(self, patient_row: dict, n: int = 3) -> list[str]:
        """Return the top *n* human-readable SHAP risk factors."""
        self._ensure_initialised()
        assert self._features is not None, "ML features not loaded"
        assert self._explainer is not None, "SHAP explainer not loaded"
        
        patient_df = pd.DataFrame([patient_row])[self._features]
        shap_values = self._explainer.shap_values(patient_df)

        factor_pairs = sorted(
            zip(self._features, shap_values[0]),
            key=lambda x: abs(x[1]),
            reverse=True,
        )

        top: list[str] = []
        for feat, val in factor_pairs[:n]:
            direction = "increases" if val > 0 else "decreases"
            label = FEATURE_LABELS.get(feat, feat)
            top.append(f"{label} ({direction} risk)")
        return top

    # -- LLM helpers --------------------------------------------------------

    @staticmethod
    def _normalize_llm_text(content) -> str:
        """Coerce varying LLM response shapes into plain text."""
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, str):
                    parts.append(item)
                elif isinstance(item, dict) and "text" in item:
                    parts.append(str(item["text"]))
                else:
                    parts.append(str(item))
            return "\n".join(p for p in parts if p)
        return str(content)

    # -- main entry point ---------------------------------------------------

    def assess_patient(self, patient_data: dict) -> dict:
        """Predict readmission risk and generate an explanation.

        Returns a dict with keys: ``risk_score``, ``risk_level``,
        ``top_factors``, ``explanation``, ``recommendations``,
        ``llm_success``.
        """
        self._ensure_initialised()
        assert self._model is not None, "ML model not loaded"
        assert self._features is not None, "ML features not loaded"

        row = self.prepare_patient_data(patient_data)

        # ML prediction — cast to Python float *before* arithmetic to
        # avoid numpy.float32 precision artefacts (e.g. 72.30000305175781).
        patient_df = pd.DataFrame([row])[self._features]
        risk_prob = float(self._model.predict_proba(patient_df)[0][1])
        risk_score = round(risk_prob * 100, 1)

        if risk_score >= 70:
            risk_level = "HIGH RISK"
        elif risk_score >= 40:
            risk_level = "MEDIUM RISK"
        else:
            risk_level = "LOW RISK"

        # SHAP explanation
        top_factors = self.get_top_shap_factors(row)
        factors_text = "\n".join(f"  - {f}" for f in top_factors)

        # Patient summary for LLM
        gender_val = patient_data.get("gender", patient_data.get("gender_Male", 0))
        gender_text = (
            "Male" if gender_val in (1, "male", "Male", "M") else "Female"
        )
        patient_summary = (
            f"Age {patient_data.get('age', 'Unknown')}, "
            f"{gender_text}, "
            f"{patient_data.get('num_prior_admissions', 0)} prior admissions, "
            f"Length of stay: {patient_data.get('length_of_stay', 'Unknown')} days, "
            f"{patient_data.get('num_medications', 0)} medications at discharge"
        )

        # LLM explanation
        llm_success = False
        if self._chain is not None:
            try:
                response = self._chain.invoke(
                    {
                        "patient_summary": patient_summary,
                        "risk_score": risk_score,
                        "risk_level": risk_level,
                        "top_factors": factors_text,
                        "num_meds": patient_data.get("num_medications", 0),
                    }
                )
                explanation_text = self._normalize_llm_text(response.content)
                llm_success = True
            except Exception:
                logger.exception("LLM call failed (model=%s)", self._active_model)
                explanation_text = (
                    f"[LLM unavailable — SHAP factors: {', '.join(top_factors)}]"
                )
        else:
            explanation_text = (
                f"[LLM unavailable — no working Gemini model found. "
                f"SHAP factors: {', '.join(top_factors)}]"
            )

        # Parse recommendations from LLM output.
        lines = explanation_text.strip().split("\n")
        recommendations = [
            line.strip()
            for line in lines
            if line.strip().startswith(("1.", "2.", "3."))
        ]
        if len(recommendations) < 3:
            recommendations = list(DEFAULT_RECOMMENDATIONS)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_factors": top_factors,
            "explanation": explanation_text,
            "recommendations": recommendations,
            "llm_success": llm_success,
        }


# ---------------------------------------------------------------------------
# Module-level singleton — cheap to import, initialised on first use.
# ---------------------------------------------------------------------------
engine = PredictionEngine()


def assess_patient(patient_data: dict) -> dict:
    """Convenience wrapper that delegates to the singleton engine."""
    return engine.assess_patient(patient_data)


# ---------------------------------------------------------------------------
# Quick manual test
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    )

    sample_patient = {
        "age": 72,
        "gender": 1,
        "num_prior_admissions": 3,
        "length_of_stay": 8,
        "num_medications": 14,
        "has_diabetes": 1,
        "has_chf": 1,
        "has_copd": 1,
        "creatinine_high": 1,
        "hemoglobin_low": 1,
        "discharge_to_home": 0,
    }

    result = assess_patient(sample_patient)

    preview_row = engine.prepare_patient_data(sample_patient)
    patient_df = pd.DataFrame([preview_row])[engine._features]
    age_val = patient_df.iloc[0].get("age", "Unknown")
    stay_val = patient_df.iloc[0].get("length_of_stay", "Unknown")

    conditions = []
    if patient_df.iloc[0].get("has_diabetes", 0) == 1:
        conditions.append("Diabetes")
    if patient_df.iloc[0].get("has_chf", 0) == 1:
        conditions.append("CHF")
    if patient_df.iloc[0].get("has_copd", 0) == 1:
        conditions.append("COPD")

    conditions_text = ", ".join(conditions) if conditions else "None reported"
    patient_id = f"PT-{random.randint(10000, 99999)}"

    print("=" * 50)
    print("[SYSTEM] INITIATING READMISSION RISK ASSESSMENT...")
    print("=" * 50)
    print()
    print("--- PATIENT PROFILE ---")
    print(f"Patient ID:      {patient_id}")
    print(f"Age:             {age_val}")
    print(f"Length of Stay:  {stay_val}")
    print(f"Key Conditions:  {conditions_text}")
    print()
    print("--- AI RISK PREDICTION ---")
    print(f"Risk Score:      {result['risk_score']}%")
    print(f"Risk Level:      [ ! ] {result['risk_level']}")
    print()
    print("--- SHAP EXPLAINABILITY (Top Risk Factors) ---")
    for factor in result["top_factors"]:
        print(f"- {factor}")
    print()
    print("--- AI RECOMMENDED ACTIONS ---")
    llm_status = "SUCCESS" if result.get("llm_success", False) else "FAILED"
    print(f"LLM status: {llm_status}")
    print()
    print(result["explanation"])
    print("=" * 50)