# Dual-Mode AI Healthcare System (Hackathon Ready)

A safety-first AI prototype that explains radiology and laboratory reports in two distinct modes:
- **Patient Mode**: Simple, empathetic explanation with "Questions to ask".
- **Clinician Mode**: Concise, structured summary with bulleted findings.

## Features
- **Dual Mode Output**: Context-aware explanations.
- **Safety First**: Extraction -> Explanation pipeline.
- **Red-Flag Escalation**: Automatic detection of critical values (e.g., Potassium > 6.0).
- **Verified Citations**: Links to MedlinePlus/RadiologyInfo.

## Quick Start (Run Locally)

### 1. Backend (Python/FastAPI)
```bash
cd backend
# Create virtual env (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Run server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend is now running at `http://localhost:8000`*

### 2. Frontend (React/Vite)
Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```
*Frontend running at `http://localhost:5173`*

## How to Demo
1. Open the Frontend.
2. Click **"Load Sample: Critical Lab"** button above the text area.
3. Click **"Analyze Report"**.
4. Observe the **URGENT** Red Flag banner.
5. Toggle between **Patient Mode** and **Clinician Mode** to see the different outputs.
6. Try **"Load Sample: Normal CT"** for a radiology example.

## Tech Stack
- **Frontend**: React, Vite, Lucide Icons, Vanilla CSS (Premium Design).
- **Backend**: FastAPI, Pydantic, Python 3.10+.
- **AI/Logic**: 
    - Mocked Hybrid Engine for Demo Stability (guarantees perfect demo performance).
    - Structured Extraction Pipeline.
