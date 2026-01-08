import json
import logging
from .models import (
    AnalysisRequest, ReportExtraction, PatientExplanation, 
    ClinicianSummary, ApiResponse
)
from .llm_client import (
    extract_facts, 
    generate_patient_explanation,
    generate_clinician_summary,
    rewrite_safely
)
from .safety_validator import validate_output
from .safe_fallbacks import get_safe_fallback_patient, get_safe_fallback_clinician

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def analyze_report(text: str, mode: str, language: str = "English") -> ApiResponse:
    logger.info(f"Analyzing report in mode: {mode}, language: {language}")
    
    # 1. Extraction
    try:
        extraction = extract_facts(text)
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        raise e 
    
    # 2. Red Flags Check
    red_flags = check_red_flags(extraction)
    
    # 3. Generate Analysis with Safety Loop
    patient_expl, p_status, p_violations = generate_safe_content(
        extraction, PatientExplanation, generate_patient_explanation, get_safe_fallback_patient, language
    )
    
    clinician_sum, c_status, c_violations = generate_safe_content(
        extraction, ClinicianSummary, generate_clinician_summary, get_safe_fallback_clinician, language
    )

    # Combine statuses (worst case wins)
    final_status = "passed"
    if p_status == "fallback" or c_status == "fallback":
        final_status = "fallback"
    elif p_status == "rewritten" or c_status == "rewritten":
        final_status = "rewritten"

    return ApiResponse(
        original_text=text,
        mode=mode,
        engine_mode="real",
        red_flags=red_flags,
        extraction=extraction,
        patient_analysis=patient_expl,
        clinician_analysis=clinician_sum,
        safety_status=final_status,
        violations=p_violations + c_violations
    )

def generate_safe_content(
    extraction: ReportExtraction, 
    model_class, 
    generator_func, 
    fallback_func,
    language: str
):
    """Generic function to generate, validate, rewrite, or fallback."""
    safety_status = "passed"
    violations = []
    
    # Attempt 1: Generate
    if language != "English":
        logging.info(f"Generating content in {language}")

    try:
        content = generator_func(extraction, language=language)
        content_json = content.model_dump_json() # Use JSON for validation string check
        validation = validate_output(content_json)
        
        if validation["is_safe"]:
            return content, "passed", []
        
        # Step 2: Retry (Rewrite)
        logger.warning(f"Safety violation detected. Retrying... Violations: {validation['violations']}")
        violations = validation["violations"]
        
        rewritten_dict = rewrite_safely(content_json, violations, model_class, language=language)
        content = model_class(**rewritten_dict)
        content_json = content.model_dump_json()
        
        validation_retry = validate_output(content_json)
        if validation_retry["is_safe"]:
            return content, "rewritten", violations
            
        # Step 3: Fallback
        logger.error(f"Safety retry failed. Falling back. Violations: {validation_retry['violations']}")
        return fallback_func(extraction, language=language), "fallback", violations + validation_retry["violations"]

    except Exception as e:
        logger.error(f"Generation error: {e}")
        return fallback_func(extraction), "fallback", [{"rule": "System Error", "match": str(e)}]

def check_red_flags(extraction: ReportExtraction) -> list[str]:
    flags = []
    # Check text findings
    for finding in extraction.findings:
        desc = finding.lower()
        if "potassium" in desc and "6." in desc: 
             flags.append("CRITICAL: Potassium level is dangerously high.")
    
    # Check structured labs
    for lab in extraction.labs:
        if lab.name and "potassium" in lab.name.lower() and lab.value is not None:
             if lab.value > 6.0:
                 flags.append(f"CRITICAL: {lab.name} {lab.value} (High)")
        
        if lab.flag == "CRITICAL":
            flags.append(f"REPORTED CRITICAL: {lab.name} {lab.value}")
    
    # Check explicit critical values
    if extraction.critical_values:
        for val in extraction.critical_values:
            flags.append(f"REPORTED CRITICAL: {val}")
            
    return list(set(flags))
