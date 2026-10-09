from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy import desc
import sqlalchemy as sa
import json
import uuid
from api.db import models
from api.config import settings
from api.config import settings

def create_assessment(db: Session, payload: dict, result: dict) -> models.Assessment:
    assessment = models.Assessment(
        patient_ref=payload.get("patient_ref"), # Extracted if it exists, otherwise None
        input_features=payload,
        age=payload.get("age", 0),
        gender=payload.get("gender", "Unknown"),
        length_of_stay=payload.get("length_of_stay", 0.0),
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        shap_values=result["top_factors"],
        llm_explanation=json.dumps({"explanation": result.get("explanation"), "recommendations": result.get("recommendations", [])}) if result.get("explanation") else None,
        llm_success=result.get("llm_success", False),
        model_version=settings.MODEL_VERSION,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment

def get_assessment(db: Session, assessment_id: str):
    try:
        uid = uuid.UUID(assessment_id)
    except ValueError:
        return None
    return db.query(models.Assessment).filter(models.Assessment.id == uid).first()

def list_assessments(db: Session, page: int = 1, page_size: int = 20, risk_level: str = None, q: str = None):
    query = db.query(models.Assessment)
    
    if risk_level:
        query = query.filter(models.Assessment.risk_level == risk_level.upper())
    
    if q:
        query = query.filter(models.Assessment.id.cast(sa.String).ilike(f"{q}%"))
        
    total = query.count()
    items = query.order_by(desc(models.Assessment.created_at)).offset((page - 1) * page_size).limit(page_size).all()
    
    return {"items": items, "total": total}

def get_dashboard_stats(db: Session):
    total = db.query(models.Assessment).count()
    if total == 0:
        return {
            "total_predictions": 0,
            "high_risk_count": 0,
            "medium_risk_count": 0,
            "low_risk_count": 0,
            "average_risk_score": 0.0,
            "llm_success_rate": 0.0,
            "last_10": []
        }
        
    high_count = db.query(models.Assessment).filter(models.Assessment.risk_level == 'HIGH RISK').count()
    med_count = db.query(models.Assessment).filter(models.Assessment.risk_level == 'MEDIUM RISK').count()
    low_count = db.query(models.Assessment).filter(models.Assessment.risk_level == 'LOW RISK').count()
    
    avg_score = db.query(func.avg(models.Assessment.risk_score)).scalar() or 0.0
    llm_success_count = db.query(models.Assessment).filter(models.Assessment.llm_success == True).count()
    
    last_10 = db.query(models.Assessment).order_by(desc(models.Assessment.created_at)).limit(10).all()
    
    return {
        "total_predictions": total,
        "high_risk_count": high_count,
        "medium_risk_count": med_count,
        "low_risk_count": low_count,
        "average_risk_score": float(avg_score),
        "llm_success_rate": (llm_success_count / total) * 100 if total > 0 else 0.0,
        "last_10": last_10
    }
