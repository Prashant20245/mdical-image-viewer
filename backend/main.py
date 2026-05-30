from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os

from compress import compress_image
from predict import predict_tumor
from report_service import save_report
from db import reports_collection
from annotation_service import save_annotation, get_annotations_by_report

app = FastAPI(title="Medical Image Viewer API")

# =========================
# CORS for Next.js frontend
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Upload Folder
# =========================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =========================
# Pydantic Models
# =========================
class AnnotationRequest(BaseModel):
    report_id: str
    roi_id: int
    x: float
    y: float
    width: float
    height: float
    note: str


class FinalReportRequest(BaseModel):
    patient: dict
    doctor: dict
    filename: str
    compression: dict
    prediction: dict
    annotations: list


# =========================
# Home Route
# =========================
@app.get("/")
def home():
    return {"message": "Medical Image Viewer Backend Running"}


# =========================
# Analyze Medical Image
# Upload + Compress + Predict ONLY
# NO MongoDB Save Here
# =========================
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # STEP 1 — Save uploaded file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # STEP 2 — JPEG2000-inspired Compression
    compression_result = compress_image(file_path)

    # STEP 3 — AI Tumor Prediction
    prediction_result = predict_tumor(file_path)

    # STEP 4 — Return draft analysis only
    return {
        "filename": file.filename,
        "original_path": file_path,
        "compressed_path": compression_result.get("compressed_path"),
        "compression": compression_result,
        "prediction": prediction_result,
    }


# =========================
# Final Save Report
# Patient + Doctor + ROI + Notes + Compression + Prediction
# =========================
@app.post("/save-report")
def save_final_report(data: FinalReportRequest):
    report_id = save_report(
        filename=data.filename,
        prediction_data=data.prediction,
        compression_data=data.compression,
        patient_data=data.patient,
        doctor_data=data.doctor,
        annotations=data.annotations,
    )

    return {
        "message": "Final report saved successfully",
        "report_id": report_id,
    }


# =========================
# Fetch All Reports History
# =========================
@app.get("/reports")
def get_reports():
    reports = list(
        reports_collection.find(
            {},
            {"_id": 0}
        ).sort("created_at", -1)
    )

    return {
        "total_reports": len(reports),
        "reports": reports,
    }


# =========================
# Save Single Annotation / ROI (Optional standalone endpoint)
# =========================
@app.post("/save-annotation")
def save_annotation_api(data: AnnotationRequest):
    annotation_id = save_annotation(
        report_id=data.report_id,
        roi_id=data.roi_id,
        x=data.x,
        y=data.y,
        width=data.width,
        height=data.height,
        note=data.note,
    )

    return {
        "message": "Annotation saved successfully",
        "annotation_id": annotation_id,
    }


# =========================
# Get Annotations By Report
# =========================
@app.get("/annotations/{report_id}")
def get_annotations_api(report_id: str):
    annotations = get_annotations_by_report(report_id)

    return {
        "report_id": report_id,
        "total_annotations": len(annotations),
        "annotations": annotations,
    }



