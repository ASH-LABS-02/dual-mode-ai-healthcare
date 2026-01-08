from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys

# Mock pypdf before importing main
sys.modules["pypdf"] = MagicMock()

from backend.main import app
from backend.models import ReportExtraction, PatientExplanation, ClinicianSummary

client = TestClient(app)

# Mock Data Objects
MOCK_EXTRACTION = ReportExtraction(
    report_type="Test",
    findings=["Test finding 1"],
    impression=["Test impression"],
    labs=[],
    critical_values=[]
)
MOCK_PATIENT = PatientExplanation(
    summary="Test Summary", 
    key_points=["Point 1"], 
    why_noted="Reason", 
    what_this_means=["Meaning 1"], 
    questions_to_ask=["Question 1"],
    disclaimer="Disclaimer text"
)
MOCK_CLINICIAN = ClinicianSummary(
    impression="Test Impression", 
    findings_bullet_points=[], 
    flagged_entities=[], 
    recommendations=[]
)

def test_analyze_endpoint_success():
    # Patch the llm_client functions to return mock objects so we don't hit OpenAI
    with patch("backend.logic.extract_facts", return_value=MOCK_EXTRACTION):
        with patch("backend.logic.generate_patient_explanation", return_value=MOCK_PATIENT):
            with patch("backend.logic.generate_clinician_summary", return_value=MOCK_CLINICIAN):
                
                response = client.post("/analyze", json={"text": "Any text", "mode": "patient"})
                assert response.status_code == 200
                data = response.json()
                assert data["engine_mode"] == "real"
                assert data["extraction"]["report_type"] == "Test"

def test_analyze_endpoint_failure_no_key():
    # Simulate an error from llm_client (e.g. key missing)
    with patch("backend.logic.extract_facts", side_effect=ValueError("LLM client not initialized")):
        response = client.post("/analyze", json={"text": "Any text", "mode": "patient"})
        # The main app catches generic exceptions and returns 500
        # BUT for explicit LLM client missing (ValueError), we map to 503 now in main.py
        assert response.status_code == 503
