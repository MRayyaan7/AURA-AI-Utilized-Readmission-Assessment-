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

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from api.db.session import get_db
from api.db import crud
import json

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
# Database Models are used internally
# ---------------------------------------------------------------------------



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
        total_predictions=0, # Removed for simplicity, or we can inject DB session here.
    )


def serialize_assessment(assessment):
    try:
        llm_data = json.loads(assessment.llm_explanation) if assessment.llm_explanation else {}
        explanation = llm_data.get("explanation", "")
        recommendations = llm_data.get("recommendations", [])
    except Exception:
        explanation = assessment.llm_explanation or ""
        recommendations = []
        
    return PredictionResult(
        id=str(assessment.id),
        timestamp=assessment.created_at.isoformat(),
        patient_data=assessment.input_features,
        risk_score=assessment.risk_score,
        risk_level=assessment.risk_level,
        top_factors=assessment.shap_values,
        explanation=explanation,
        recommendations=recommendations,
        llm_success=assessment.llm_success,
    )


@app.post("/api/v1/predict", response_model=PredictionResult, tags=["predictions"])
def predict(payload: PatientInput, db: Session = Depends(get_db)):
    """Run a readmission risk assessment for a single patient."""
    try:
        result = assess_patient(payload.model_dump())
    except Exception:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction engine error")

    assessment = crud.create_assessment(db, payload.model_dump(), result)
    
    logger.info(
        "Prediction %s: score=%.1f%% level=%s",
        assessment.id,
        assessment.risk_score,
        assessment.risk_level,
    )
    return serialize_assessment(assessment)


@app.get(
    "/api/v1/predictions",
    tags=["predictions"],
)
def list_predictions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """List past predictions with pagination, search, and optional filtering."""
    results = crud.list_assessments(db, page=page, page_size=page_size, risk_level=risk_level, q=q)
    return {
        "items": [serialize_assessment(r) for r in results["items"]],
        "total": results["total"]
    }


@app.get(
    "/api/v1/predictions/{prediction_id}",
    response_model=PredictionResult,
    tags=["predictions"],
)
def get_prediction(prediction_id: str, db: Session = Depends(get_db)):
    """Get a specific prediction by ID."""
    assessment = crud.get_assessment(db, prediction_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return serialize_assessment(assessment)


@app.get("/api/v1/stats/dashboard", tags=["dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Return aggregate statistics for the dashboard."""
    stats = crud.get_dashboard_stats(db)
    # The frontend expects 'last_10' array as objects of PredictionResult but DashboardStats Pydantic model might drop it.
    # We will return the dict directly to ensure we can append `last_10` without redefining the Pydantic model for now.
    stats['last_10'] = [serialize_assessment(r).model_dump() for r in stats['last_10']]
    return stats



# Keep the old endpoint for backwards compatibility
@app.post("/predict", tags=["legacy"], include_in_schema=False)
def predict_legacy(payload: PatientInput):
    """Legacy endpoint — redirects to /api/v1/predict."""
    return predict(payload)
