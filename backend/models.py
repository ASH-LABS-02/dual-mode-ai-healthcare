from pydantic import BaseModel
from typing import List, Optional, Dict, Literal

class AnalysisRequest(BaseModel):
    text: str
    mode: Literal["patient", "clinician"] = "patient"
    language: str = "English"

class LabResult(BaseModel):
    name: str
    value: float
    unit: Optional[str] = None
    reference_low: Optional[float] = None
    reference_high: Optional[float] = None
    flag: Optional[Literal["HIGH", "LOW", "NORMAL", "CRITICAL"]] = None

class ReportExtraction(BaseModel):
    report_type: str # Relaxed from Literal to prevent 500 errors on LLM hallucinations
    exam: Optional[str] = None
    findings: List[str]
    impression: List[str]
    labs: List[LabResult]
    # Keeping critical_values for logic.py compatibility, 
    # but we can derive it from labs where flag='CRITICAL'
    critical_values: List[str] = []

class PatientExplanation(BaseModel):
    summary: str
    key_points: List[str]
    why_noted: str
    what_this_means: List[str]
    questions_to_ask: List[str]
    disclaimer: str
    urgent_banner: Optional[str] = None

class ClinicianSummary(BaseModel):
    impression: str
    findings_bullet_points: List[str]
    flagged_entities: List[str]
    recommendations: List[str]

class ApiResponse(BaseModel):
    original_text: str
    mode: str
    engine_mode: Literal["real", "mock"]
    red_flags: List[str]
    extraction: ReportExtraction
    patient_analysis: Optional[PatientExplanation] = None
    clinician_analysis: Optional[ClinicianSummary] = None
    safety_status: Literal["passed", "rewritten", "fallback"] = "passed"
    violations: List[Dict[str, str]] = []
