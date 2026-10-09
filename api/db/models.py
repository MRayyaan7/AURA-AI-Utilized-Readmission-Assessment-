from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import relationship
import sqlalchemy as sa
from datetime import datetime, timezone
import uuid
from api.db.session import Base

# Portable JSON type
PortableJSON = JSON().with_variant(JSONB(), "postgresql")

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        CheckConstraint(role.in_(['admin', 'doctor', 'nurse']), name='check_user_role'),
    )

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    patient_ref = Column(String, nullable=True)
    created_by = Column(sa.Uuid, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    # Payload exact match
    input_features = Column(PortableJSON, nullable=False)
    
    # Denormalized filters
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    length_of_stay = Column(Float, nullable=False)
    
    # Prediction results
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # 'LOW RISK', 'MEDIUM RISK', 'HIGH RISK'
    shap_values = Column(PortableJSON, nullable=False)
    llm_explanation = Column(String, nullable=True)
    llm_success = Column(Boolean, default=False)
    model_version = Column(String, nullable=False)

    __table_args__ = (
        Index("ix_assessments_created_by_created_at", "created_by", "created_at"),
        Index("ix_assessments_risk_level", "risk_level"),
    )

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(sa.Uuid, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(sa.Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(sa.Uuid, nullable=True) # Intentionally not a strict FK in case of user deletion or system actions
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
