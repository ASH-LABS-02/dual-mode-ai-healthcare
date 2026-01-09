import re

# BLOCKLISTS
BLOCK_SEVERITY = [
    r"\bdangerous(ly)?\b", r"\blife-threatening\b", r"\bcritical condition\b", 
    r"\bemergency\b", r"\bsevere risk\b",
    r"no need to worry", r"nothing to worry",
    r"you're fine", r"you are fine"
]

BLOCK_DIAGNOSIS = [
    r"this indicates you have", r"this means you have", r"diagnosed with", 
    r"suggests cancer", r"heart failure", r"likely due to", 
    r"caused by", r"prognosis", r"will lead to"
]

BLOCK_TREATMENT = [
    r"\btake\s+medications?", r"\bstart\s+medications?", r"\bstop\s+medications?",
    r"\bdosage\b", r"\bprescription\b",
    r"seek immediate care", r"go to er", 
    r"requires evaluation", r"requires monitoring", r"must be treated"
]

BLOCK_LIFESTYLE = [
    r"balanced diet", r"healthy lifestyle", r"avoid foods", r"drink more water", r"reduce salt"
]

BLOCK_PHRASING = [
    r"warrants clinician review",
    r"affect my health",
    r"what does .* mean",
    r"no issues", r"no problems"
]

ALL_BLOCKS = [
    ("SEVERITY", BLOCK_SEVERITY),
    ("DIAGNOSIS", BLOCK_DIAGNOSIS),
    ("TREATMENT", BLOCK_TREATMENT),
    ("LIFESTYLE", BLOCK_LIFESTYLE),
    ("PHRASING", BLOCK_PHRASING)
]

def validate_output(text: str) -> dict:
    """
    Validates the text against safety rules.
    Returns:
    {
      "is_safe": bool,
      "violations": [ { "rule": str, "match": str } ],
      "sanitized_text": str | None
    }
    """
    violations = []
    text_lower = text.lower()
    
    for category, regexes in ALL_BLOCKS:
        for pattern in regexes:
            if re.search(pattern, text_lower):
                violations.append({"rule": category, "match": pattern})

    return {
        "is_safe": len(violations) == 0,
        "violations": violations,
        "sanitized_text": text if len(violations) == 0 else None
    }
