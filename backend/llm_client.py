import os
import json
import base64
from dotenv import load_dotenv
from openai import OpenAI
from .models import ReportExtraction, PatientExplanation, ClinicianSummary
from .prompts import SAFETY_EDITOR_PROMPT, EXTRACTION_PROMPT, PATIENT_PROMPT, CLINICIAN_PROMPT, NO_TEXT_PATIENT_PROMPT

load_dotenv(override=True)

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o") # Default to vision-capable model
BASE_URL = os.getenv("OPENAI_BASE_URL")


client = None
if API_KEY:
    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

def is_real_mode():
    return client is not None

def extract_text_from_image(image_bytes: bytes) -> str:
    """Uses LLM Vision to read text from an image. Strictly OCR only."""
    if not client:
        raise ValueError("LLM client not initialized")

    encoded_image = base64.b64encode(image_bytes).decode('utf-8')
    
    system_prompt = """
    You are an expert medical transcriptionist.
    Your task is to extract all visible text from this medical image.
    
    RULES:
    1. Transcribe any text/labels visible on the image exactly.
    2. Do NOT describe the visual findings (anatomy, abnormalities, or diagnosis).
    3. Do NOT invent findings that are not clearly visible.
    4. If the image is a medical scan (X-ray, MRI, CT, etc.) with NO significant written reporting text, return ONLY the string: [[NO_REPORT_TEXT_FOUND]]
    
    Output ONLY the transcribed text or the special string.
    """

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user", 
                    "content": [
                        {"type": "text", "text": "Extract all text from this medical image."},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"}}
                    ]
                }
            ],
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Vision Extraction Error: {e}")
        raise e

def extract_facts(text: str) -> ReportExtraction:
    if not client:
        raise ValueError("LLM client not initialized")
        
    if "[[NO_REPORT_TEXT_FOUND]]" in text:
        # Return a dummy extraction that signals the generator to use the fallback prompt
        return ReportExtraction(
            report_type="Imaging Scan (No Text)",
            findings=[], 
            impression=[], 
            labs=[], 
            critical_values=[]
        )

    system_prompt = f"""
    {EXTRACTION_PROMPT}
    """
    
    schema = json.dumps(ReportExtraction.model_json_schema())

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": f"{system_prompt}\nSchema: {schema}"},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        # Ensure regex checks or post-processing if needed, for now trust LLM + Schema
        return ReportExtraction(**data)
    except Exception as e:
        print(f"LLM Extraction Error: {e}")
        # Fallback to an empty/error extraction if parsing fails, or re-raise
        # For now, return a basic error object wrapped in ReportExtraction structure
        # dependent on how robust we want this to be.
        raise e

def generate_patient_explanation(extraction: ReportExtraction, language: str = "English") -> PatientExplanation:
    if not client:
        raise ValueError("LLM client not initialized")
        
    # Check for the special condition where no text was found in the image
    is_image_only = extraction.report_type == "Imaging Scan (No Text)" and not extraction.findings

    is_image_only = extraction.report_type == "Imaging Scan (No Text)" and not extraction.findings

    if is_image_only:
        system_prompt = f"""
        {NO_TEXT_PATIENT_PROMPT}

        OUTPUT IN LANGUAGE: {language}
        """
    else:
        # Standard Prompt
        system_prompt = f"""
        {PATIENT_PROMPT}

        OUTPUT IN LANGUAGE: {language}
        """
    
    schema = json.dumps(PatientExplanation.model_json_schema())
    facts_json = extraction.model_dump_json()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"{system_prompt}\nSchema: {schema}"},
            {"role": "user", "content": f"Findings: {facts_json}"}
        ],
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    return PatientExplanation(**data)

def generate_clinician_summary(extraction: ReportExtraction, language: str = "English") -> ClinicianSummary:
    if not client:
        raise ValueError("LLM client not initialized")

    system_prompt = f"""
    {CLINICIAN_PROMPT}
    
    OUTPUT IN LANGUAGE: {language}
    """
    
    schema = json.dumps(ClinicianSummary.model_json_schema())
    facts_json = extraction.model_dump_json()

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"{system_prompt}\nSchema: {schema}"},
            {"role": "user", "content": f"Findings: {facts_json}"}
        ],
        response_format={"type": "json_object"}
    )
    data = json.loads(response.choices[0].message.content)
    return ClinicianSummary(**data)

def rewrite_safely(unsafe_text: str, violations: list, schema_model, language: str = "English") -> dict:
    if not client:
        raise ValueError("LLM client not initialized")
        
    system_prompt = f"""
    {SAFETY_EDITOR_PROMPT}

    VIOLATIONS FOUND: {json.dumps(violations)}
    OUTPUT IN LANGUAGE: {language}
    """
    
    schema = json.dumps(schema_model.model_json_schema())

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": f"{system_prompt}\nSchema: {schema}"},
            {"role": "user", "content": f"Unsafe Draft: {unsafe_text}"}
        ],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)
