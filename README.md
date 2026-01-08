
# Dual-Mode AI Healthcare System 🏥

<div align="center">

![Status](https://img.shields.io/badge/Status-Prototype-blue) 
![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React-green)
![License](https://img.shields.io/badge/License-MIT-purple)

**A safety-first AI companion that translates complex medical reports into clear, actionable insights for both patients and clinicians.**

[Features](#features) • [Getting Started](#getting-started) • [Architecture](#architecture) • [Safety](#safety--security)

</div>

---

## 💡 Overview

New medical reports (Radiology, Pathology, Labs) are often incomprehensible to patients and time-consuming for clinicians to summarize. **Dual-Mode AI** solves this by providing two distinct, safety-validated views of the same medical data:

1.  **Patient Mode**: Empathetic, jargon-free explanations with "Questions to Ask" and red-flag alerts.
2.  **Clinician Mode**: High-density technical summaries, bulleted findings, and extraction of critical values.

## ✨ Key Features

### 🩺 Advanced Analysis
-   **Dual-Persona Output**: tailored context for different users.
-   **Multimodal Input**: Supports **Text**, **PDF** documents, and **Images** (OCR for scanned reports).
-   **Structured Extraction**: Converts unstructured text into structured JSON data (findings, values, units).

### 🌍 Global Accessibility
-   **Multilingual Support**: Real-time translation and localized explanation in:
    -   🇺🇸 English
    -   🇪🇸 Spanish
    -   🇫🇷 French
    -   🇨🇳 Mandarin
    -   🇮🇳 Hindi
-   **Audio/Accessibility**: (Coming Soon) Text-to-speech for visually impaired users.

### 🛡️ Safety & Reliability
-   **Red Flag Detection**: Automatic escalation for critical values (e.g., "Potassium > 6.0 mmol/L").
-   **Hallucination Guardrails**: multi-step "Extraction → Verification → Generation" pipeline.
-   **Safety Rewrites**: Self-correction loop if the AI detects unsafe or non-grounded content.

### 💾 History & Persistence
-   **Auto-Save**: All analyzed reports are automatically stored locally.
-   **History Timeline**: View past reports chronologically.
-   **Read-Only Review**: Re-visit previous analyses without re-triggering AI costs.

---

## 🚀 Getting Started

### Prerequisites
-   **Node.js** (v16+)
-   **Python** (v3.10+)
-   **OpenAI API Key** (for real-time analysis)

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Configure Environment
# Create a .env file in the root or export the variable
export OPENAI_API_KEY="sk-..."

# Run the server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend will serve API at `http://localhost:8000`*

### 2. Frontend Setup (React + Vite)
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```
*Frontend will launch at `http://localhost:5173`*

---

## 📖 Usage Guide

1.  **Select Input Method**: Paste text, upload a PDF, or drop an image of a report.
2.  **Choose Language**: Select your preferred language from the dropdown.
3.  **Analyze**: Click "Analyze Report".
4.  **View Results**:
    -   **Patient View**: Read the summary, check "What this means", and see questions to ask your doctor.
    -   **Clinician View**: Switch tabs to see technical findings and recommendations.
5.  **Check History**: Click "History" in the top navigation to see previous reports.

---

## 🏗️ Architecture

```mermaid
graph TD
    A[User Input] -->|PDF/Image/Text| B(FastAPI Backend)
    B -->|OCR/Parsing| C{Extraction Engine}
    C -->|Structured JSON| D[Safety Validator]
    D -->|Passed| E[LLM Generation (GPT-4)]
    D -->|Violation| C
    E -->|Patient/Clinician Prompt| F[Final Response]
    F -->|JSON| G[History Storage]
    F -->|JSON| H[React Frontend]
```

-   **Backend**: FastAPI handles request orchestration, validation, and LLM chaining.
-   **Safety Layer**: A dedicated validator checks for "advice giving" or "hallucinations" before showing output.
-   **Frontend**: React ecosystem with Tailwind CSS for a premium, responsive UI.

## 🛡️ Safety & Security
*   **No PII Storage**: The system is designed to strip or ignore PII (Personally Identifiable Information) in the extraction phase.
*   **Medical Disclaimer**: Prominent disclaimers ensure users understand this is an AI tool, not a doctor.
*   **Local Storage**: History is currently stored in a local JSON file (`backend/data/history.json`) for privacy and ease of prototyping.

## 📄 License
MIT License. Open for educational and prototype usage.
