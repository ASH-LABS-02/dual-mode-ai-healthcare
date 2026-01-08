#!/bin/bash
# Startup script to run backend with the correct dependencies
VENV_PYTHON="/Users/apple/.gemini/antigravity/scratch/.venv/bin/python3"

# Ensure we are in the script's directory (project root)
cd "$(dirname "$0")"

echo "Starting Backend Server from $(pwd)..."
$VENV_PYTHON -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
