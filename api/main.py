"""
FastAPI application for the AURA API.

Provides REST endpoints for patient risk assessment, prediction history,
dashboard statistics, and health monitoring.
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from api.agent import engine, assess_patient

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configure logging once at app startup
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------
class PatientInput(BaseModel):
    """Input schema for patient risk assessment."""

    age: int = Field(..., ge=0, le=120, description="Patient age in years")
    gender: str = Field(..., description="Patient gender (Male/Female)")
    num_prior_admissions: int = Field(
        ..., ge=0, description="Number of prior admissions in the last 12 months"
    )
    length_of_stay: int = Field(..., ge=1, description="Length of stay in days")
    num_medications: int = Field(
        ..., ge=0, description="Number of medications at discharge"
    )
    has_diabetes: int = Field(..., ge=0, le=1, description="Diabetes diagnosis (0/1)")
    has_chf: int = Field(
        ..., ge=0, le=1, description="Congestive Heart Failure diagnosis (0/1)"
    )
    has_copd: int = Field(..., ge=0, le=1, description="COPD diagnosis (0/1)")
    creatinine_high: int = Field(
        ..., ge=0, le=1, description="Elevated creatinine marker (0/1)"
    )
    hemoglobin_low: int = Field(
        ..., ge=0, le=1, description="Low hemoglobin marker (0/1)"
    )
    discharge_to_home: int = Field(
        ..., ge=0, le=1, description="Discharged to home vs facility (0/1)"
    )


class PredictionResult(BaseModel):
    """Output schema for a risk prediction."""

    id: str
    timestamp: str
    patient_data: dict
    risk_score: float
    risk_level: str
    top_factors: list[str]
    explanation: str
    recommendations: list[str]
    llm_success: bool


class DashboardStats(BaseModel):
    """Aggregate statistics for the dashboard."""

    total_predictions: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_risk_score: float
    llm_success_rate: float


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    ml_model_loaded: bool
    llm_available: bool
    active_llm_model: Optional[str]
    total_predictions: int


# ---------------------------------------------------------------------------
# In-memory prediction store (replaced with DB in Phase 2)
# ---------------------------------------------------------------------------
_predictions: list[dict] = []


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-warm the ML engine on startup so the first request is fast."""
    logger.info("Pre-warming prediction engine...")
    try:
        engine._ensure_initialised()
        logger.info("Prediction engine ready")
    except Exception:
        logger.exception("Engine pre-warm failed — will retry on first request")
    yield
    logger.info("Shutting down")


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AURA API",
    description=(
        "AURA — AI-Utilized Readmission Assessment. "
        "Predicts 30-day hospital readmission risk using XGBoost + SHAP, "
        "with optional Gemini LLM clinical explanations."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev servers and production origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes — /api/v1/
# ---------------------------------------------------------------------------


@app.get("/", tags=["health"])
def root():
    """Redirect-free root health ping."""
    return {"status": "ok"}


@app.get("/api/v1/health", response_model=HealthResponse, tags=["health"])
def health_check():
    """Detailed health check including ML and LLM status."""
    try:
        engine._ensure_initialised()
        ml_loaded = engine._model is not None
    except Exception:
        ml_loaded = False

    return HealthResponse(
        status="ok" if ml_loaded else "degraded",
        ml_model_loaded=ml_loaded,
        llm_available=engine._llm is not None,
        active_llm_model=engine._active_model,
        total_predictions=len(_predictions),
    )


@app.post("/api/v1/predict", response_model=PredictionResult, tags=["predictions"])
def predict(payload: PatientInput):
    """Run a readmission risk assessment for a single patient."""
    try:
        result = assess_patient(payload.model_dump())
    except Exception:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction engine error")

    prediction = PredictionResult(
        id=str(uuid4()),
        timestamp=datetime.now(timezone.utc).isoformat(),
        patient_data=payload.model_dump(),
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        top_factors=result["top_factors"],
        explanation=result["explanation"],
        recommendations=result["recommendations"],
        llm_success=result["llm_success"],
    )

    _predictions.append(prediction.model_dump())
    logger.info(
        "Prediction %s: score=%.1f%% level=%s",
        prediction.id,
        prediction.risk_score,
        prediction.risk_level,
    )
    return prediction


@app.get(
    "/api/v1/predictions",
    response_model=list[PredictionResult],
    tags=["predictions"],
)
def list_predictions(
    limit: int = Query(20, ge=1, le=100, description="Max results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    risk_level: Optional[str] = Query(
        None, description="Filter by risk level (HIGH RISK, MEDIUM RISK, LOW RISK)"
    ),
):
    """List past predictions, newest first, with optional filtering."""
    results = list(reversed(_predictions))

    if risk_level:
        results = [r for r in results if r["risk_level"] == risk_level.upper()]

    return results[offset : offset + limit]


@app.get(
    "/api/v1/predictions/{prediction_id}",
    response_model=PredictionResult,
    tags=["predictions"],
)
def get_prediction(prediction_id: str):
    """Get a specific prediction by ID."""
    for pred in _predictions:
        if pred["id"] == prediction_id:
            return pred
    raise HTTPException(status_code=404, detail="Prediction not found")


@app.get("/api/v1/stats/dashboard", response_model=DashboardStats, tags=["dashboard"])
def dashboard_stats():
    """Return aggregate statistics for the dashboard."""
    total = len(_predictions)
    if total == 0:
        return DashboardStats(
            total_predictions=0,
            high_risk_count=0,
            medium_risk_count=0,
            low_risk_count=0,
            average_risk_score=0.0,
            llm_success_rate=0.0,
        )

    high = sum(1 for p in _predictions if p["risk_level"] == "HIGH RISK")
    medium = sum(1 for p in _predictions if p["risk_level"] == "MEDIUM RISK")
    low = sum(1 for p in _predictions if p["risk_level"] == "LOW RISK")
    avg_score = sum(p["risk_score"] for p in _predictions) / total
    llm_ok = sum(1 for p in _predictions if p["llm_success"]) / total

    return DashboardStats(
        total_predictions=total,
        high_risk_count=high,
        medium_risk_count=medium,
        low_risk_count=low,
        average_risk_score=round(avg_score, 1),
        llm_success_rate=round(llm_ok, 2),
    )


# Keep the old endpoint for backwards compatibility
@app.post("/predict", tags=["legacy"], include_in_schema=False)
def predict_legacy(payload: PatientInput):
    """Legacy endpoint — redirects to /api/v1/predict."""
    return predict(payload)
