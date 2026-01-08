from .models import PatientExplanation, ClinicianSummary, ReportExtraction

def get_safe_fallback_patient(extraction: ReportExtraction, language: str = "English") -> PatientExplanation:
    """Deterministic, safe fallback for Patient Explanation."""
    # Findings are now strings
    findings_list = list(extraction.findings)
    # Add labs to findings list for the fallback view
    for lab in extraction.labs:
        val_str = f"{lab.name}: {lab.value} {lab.unit or ''}"
        if lab.flag:
            val_str += f" ({lab.flag})"
        findings_list.append(val_str)
    
    # Define key_points and q_text for the fallback, assuming findings_list is the fallback for key_points
    key_points = findings_list
    q_text = "How should this be interpreted in my situation?" # Default fallback question

    # Note: Currently fallback strings are English-only. 
    # In a full production system, we would have a translation dictionary here.
    
    return PatientExplanation(
        summary="The report contains findings that could not be automatically explained safely. Please discuss these results directly with your clinician.",
        key_points=key_points,
        why_noted="The automated system could not generate a simplified explanation for this specific report configuration.",
        what_this_means=["Clinical correlation recommended."],
        questions_to_ask=[q_text],
        disclaimer="This explanation is for informational purposes only and is not a medical diagnosis or treatment recommendation. Always consult a qualified healthcare professional."
    )

def get_safe_fallback_clinician(extraction: ReportExtraction, language: str = "English") -> ClinicianSummary:
    """Deterministic, safe fallback for Clinician Summary."""
    findings_list = list(extraction.findings)
    for lab in extraction.labs:
        val_str = f"{lab.name}: {lab.value} {lab.unit or ''}"
        if lab.flag:
            val_str += f" [{lab.flag}]"
        findings_list.append(val_str)
    
    return ClinicianSummary(
        impression="Analysis completed. Review original report for details.",
        findings_bullet_points=findings_list,
        flagged_entities=[],
        recommendations=["Review full report."]
    )
