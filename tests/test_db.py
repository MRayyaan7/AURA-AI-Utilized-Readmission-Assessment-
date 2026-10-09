import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from api.main import app
from api.db.session import Base, get_db
from api.db.models import Assessment
import uuid

from sqlalchemy.pool import StaticPool

# In-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    # Mocking ML model and Gemini can be done by overriding assess_patient, but since we are doing endpoint testing:
    from unittest.mock import patch
    with patch('api.main.assess_patient') as mock_assess:
        mock_assess.return_value = {
            "risk_score": 85.5,
            "risk_level": "HIGH RISK",
            "top_factors": ["High age", "Prior admissions"],
            "explanation": "Test explanation",
            "recommendations": ["Do this", "Do that"],
            "llm_success": True
        }
        yield TestClient(app)

def test_persistence(client):
    payload = {
        "age": 75,
        "gender": "male",
        "length_of_stay": 5.0,
        "num_prior_admissions": 2,
        "num_medications": 10,
        "has_diabetes": 1,
        "has_chf": 0,
        "has_copd": 1,
        "creatinine_high": 0,
        "hemoglobin_low": 1,
        "discharge_to_home": 1
    }
    
    # Create prediction
    res = client.post("/api/v1/predict", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["risk_level"] == "HIGH RISK"
    pred_id = data["id"]
    
    # Retrieve prediction
    res2 = client.get(f"/api/v1/predictions/{pred_id}")
    assert res2.status_code == 200
    assert res2.json()["id"] == pred_id

def test_pagination_and_filters(client):
    payload = {
        "age": 50,
        "gender": "female",
        "length_of_stay": 3.0,
        "num_prior_admissions": 1,
        "num_medications": 5,
        "has_diabetes": 0,
        "has_chf": 0,
        "has_copd": 0,
        "creatinine_high": 0,
        "hemoglobin_low": 0,
        "discharge_to_home": 1
    }
    
    # Add multiple predictions
    for _ in range(5):
        client.post("/api/v1/predict", json=payload)
        
    res = client.get("/api/v1/predictions?page=1&page_size=3")
    data = res.json()
    assert data["total"] == 5
    assert len(data["items"]) == 3
    
    res2 = client.get("/api/v1/predictions?risk_level=HIGH RISK")
    assert res2.json()["total"] == 5
    
    res3 = client.get("/api/v1/predictions?risk_level=LOW RISK")
    assert res3.json()["total"] == 0

def test_dashboard_aggregates(client):
    payload = {
        "age": 50,
        "gender": "female",
        "length_of_stay": 3.0,
        "num_prior_admissions": 1,
        "num_medications": 5,
        "has_diabetes": 0,
        "has_chf": 0,
        "has_copd": 0,
        "creatinine_high": 0,
        "hemoglobin_low": 0,
        "discharge_to_home": 1
    }
    client.post("/api/v1/predict", json=payload)
    client.post("/api/v1/predict", json=payload)
    
    res = client.get("/api/v1/stats/dashboard")
    data = res.json()
    assert data["total_predictions"] == 2
    assert data["high_risk_count"] == 2
    assert data["llm_success_rate"] == 100.0
    assert len(data["last_10"]) == 2
