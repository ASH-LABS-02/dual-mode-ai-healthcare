import sys
import os

# Ensure backend can be imported
sys.path.append(os.getcwd())

from backend.logic import analyze_report
from backend.models import ReportExtraction, LabResult, PatientExplanation, ClinicianSummary
from unittest.mock import MagicMock, patch

# Mock Objects
MOCK_EXTRACTION = ReportExtraction(
    report_type="lab",
    exam="Blood Count",
    findings=["Anemia noted"],
    impression=["Low Hemoglobin compatible with anemia"],
    labs=[LabResult(name="Hemoglobin", value=8.0, unit="g/dL", flag="LOW")],
    critical_values=[]
)
MOCK_PATIENT = PatientExplanation(
    summary="The report notes high potassium levels.",
    key_points=["Potassium: 6.2 mmol/L (High)"],
    why_noted="Report flags value outside reference range.",
    what_this_means=["This is typically reviewed by a clinician."],
    questions_to_ask=["How should this be interpreted in my situation?"]
)
MOCK_CLINICIAN = ClinicianSummary(impression="Test Impression", findings_bullet_points=[], flagged_entities=[], recommendations=[])

def run_test():
    print("Running Logic verification...")
    try:
        # Patch everything to avoid API calls
        with patch("backend.logic.extract_facts", return_value=MOCK_EXTRACTION):
            with patch("backend.logic.generate_patient_explanation", return_value=MOCK_PATIENT):
                with patch("backend.logic.generate_clinician_summary", return_value=MOCK_CLINICIAN):
                    with patch("backend.logic.rewrite_safely", return_value=MOCK_PATIENT.model_dump()):
                        
                        response = analyze_report("Test text", "patient")
                        print("Success!")
                        print(response.model_dump_json(indent=2))

    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
