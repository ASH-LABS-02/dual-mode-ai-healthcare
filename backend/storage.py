import json
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

# Vercel Serverless environment has read-only filesystem except /tmp
if os.environ.get("VERCEL"):
    HISTORY_FILE = "/tmp/history.json"
else:
    HISTORY_FILE = os.path.join(os.path.dirname(__file__), "data", "history.json")

def _load_history() -> List[Dict[str, Any]]:
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading history: {e}")
        return []

def _save_history(history: List[Dict[str, Any]]):
    os.makedirs(os.path.dirname(HISTORY_FILE), exist_ok=True)
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def save_report(api_response_dict: Dict[str, Any]) -> str:
    """
    Saves the analyzed report to history.
    Returns the generated report ID.
    """
    history = _load_history()
    
    report_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    # Create the history entry
    entry = {
        "id": report_id,
        "timestamp": timestamp,
        # We need to extract some metadata for the list view
        "report_type": api_response_dict.get("extraction", {}).get("report_type", "Unknown"),
        "red_flags": api_response_dict.get("red_flags", []),
        "full_data": api_response_dict # Store the full response
    }
    
    history.append(entry)
    _save_history(history)
    return report_id

def get_history_list() -> List[Dict[str, Any]]:
    """
    Returns a lightweight list of history items (without full data).
    """
    history = _load_history()
    # Sort by timestamp desc
    history.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Return only metadata
    return [
        {
            "id": item["id"],
            "timestamp": item["timestamp"],
            "report_type": item["report_type"],
            "red_flags": item["red_flags"]
        }
        for item in history
    ]

def get_report_detail(report_id: str) -> Optional[Dict[str, Any]]:
    history = _load_history()
    for item in history:
        if item["id"] == report_id:
            return item["full_data"]
    return None
