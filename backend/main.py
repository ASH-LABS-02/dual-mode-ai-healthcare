from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .models import AnalysisRequest, ApiResponse
from .logic import analyze_report
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Dual-Mode AI Healthcare Backend")


origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze", response_model=ApiResponse)
async def analyze_endpoint(request: AnalysisRequest):
    try:
        response = analyze_report(request.text, request.mode, request.language)
        # Save to history - async/background task would be better but simple sync call is fine for prototype
        try:
             report_id = save_report(response.model_dump())
             response.id = report_id
        except Exception as e:
             logger.error(f"Failed to save history: {e}")
             
        return response
    except ValueError as e:
        # Catch explicit "LLM client not initialized" from logic/client
        if "LLM client" in str(e):
             raise HTTPException(status_code=503, detail="OpenAI API Key is missing. Server is strictly in Real Mode. Please configure .env.")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File
import io
from pypdf import PdfReader

@app.post("/extract_text")
async def extract_text_endpoint(file: UploadFile = File(...)):
    try:
        content_type = file.content_type
        contents = await file.read()
        
        # 1. Handle PDF
        if content_type == "application/pdf":
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return {"text": text.strip()}
            
        # 2. Handle Images (Vision)
        if content_type.startswith("image/"):
            # Import locally to avoid circular deps if any, or just for cleanliness
            from .llm_client import extract_text_from_image
            text = extract_text_from_image(contents)
            return {"text": text.strip()}

        raise HTTPException(status_code=400, detail="Only PDF and Image files are supported.")
        
    except Exception as e:
        logger.error(f"File extraction failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

from .storage import save_report, get_history_list, get_report_detail

@app.get("/history")
def get_history():
    """Get list of past analyses."""
    return get_history_list()

@app.get("/history/{report_id}")
def get_history_item(report_id: str):
    """Get full details of a specific analysis."""
    data = get_report_detail(report_id)
    if not data:
        raise HTTPException(status_code=404, detail="Report not found")
    return data

from fastapi.responses import Response
from .pdf_generator import generate_report_pdf

@app.get("/history/{report_id}/pdf")
def get_report_pdf(report_id: str):
    """Download analysis as PDF."""
    data = get_report_detail(report_id)
    if not data:
        raise HTTPException(status_code=404, detail="Report not found")
    
    pdf_bytes = generate_report_pdf(data)
    
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=report_{report_id}.pdf"}
    )

def health_check():
    return {"status": "ok", "message": "Backend is running"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
