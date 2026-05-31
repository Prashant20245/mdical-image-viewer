from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext

import shutil
import os

from compress import compress_image
from predict import predict_tumor
from report_service import save_report
from db import reports_collection, doctors_collection
from annotation_service import (
    save_annotation,
    get_annotations_by_report,
)

app = FastAPI(title="Medical Image Viewer API")

# =========================
# Password Hashing
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
# Models
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


class DoctorRegisterRequest(BaseModel):
    doctor_name: str
    email: str
    password: str
    department: str
    hospital: str


class DoctorLoginRequest(BaseModel):
    email: str
    password: str

# =========================
# Home
# =========================

@app.get("/")
def home():
    return {
        "message": "Medical Image Viewer Backend Running"
    }

# =========================
# Doctor Registration
# =========================

@app.post("/register")
def register_doctor(data: DoctorRegisterRequest):

    existing_doctor = doctors_collection.find_one(
        {"email": data.email}
    )

    if existing_doctor:
        return {
            "success": False,
            "message": "Doctor already registered"
        }

    hashed_password = pwd_context.hash(
        data.password
    )

    doctors_collection.insert_one({
        "doctor_name": data.doctor_name,
        "email": data.email,
        "password": hashed_password,
        "department": data.department,
        "hospital": data.hospital,
    })

    return {
        "success": True,
        "message": "Doctor registered successfully"
    }

# =========================
# Doctor Login
# =========================

@app.post("/login")
def login_doctor(data: DoctorLoginRequest):

    doctor = doctors_collection.find_one(
        {"email": data.email}
    )

    if not doctor:
        return {
            "success": False,
            "message": "Doctor not found"
        }

    valid_password = pwd_context.verify(
        data.password,
        doctor["password"]
    )

    if not valid_password:
        return {
            "success": False,
            "message": "Invalid password"
        }

    return {
        "success": True,
        "doctor": {
            "doctor_name": doctor["doctor_name"],
            "email": doctor["email"],
            "department": doctor["department"],
            "hospital": doctor["hospital"],
        }
    }

# =========================
# Analyze Image
# =========================

@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...)
):
    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    compression_result = compress_image(
        file_path
    )

    prediction_result = predict_tumor(
        file_path
    )

    return {
        "filename": file.filename,
        "original_path": file_path,
        "compressed_path":
            compression_result.get(
                "compressed_path"
            ),
        "compression":
            compression_result,
        "prediction":
            prediction_result,
    }

# =========================
# Save Report
# =========================

@app.post("/save-report")
def save_final_report(
    data: FinalReportRequest
):

    report_id = save_report(
        filename=data.filename,
        prediction_data=data.prediction,
        compression_data=data.compression,
        patient_data=data.patient,
        doctor_data=data.doctor,
        annotations=data.annotations,
    )

    return {
        "message":
            "Final report saved successfully",
        "report_id": report_id,
    }

# =========================
# Reports History
# =========================

@app.get("/reports")
def get_reports():

    reports = list(
        reports_collection.find(
            {},
            {"_id": 0}
        ).sort(
            "created_at",
            -1
        )
    )

    return {
        "total_reports": len(reports),
        "reports": reports,
    }

# =========================
# Save Annotation
# =========================

@app.post("/save-annotation")
def save_annotation_api(
    data: AnnotationRequest
):

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
        "message":
            "Annotation saved successfully",
        "annotation_id":
            annotation_id,
    }

# =========================
# Get Annotations
# =========================

@app.get("/annotations/{report_id}")
def get_annotations_api(
    report_id: str
):

    annotations = get_annotations_by_report(
        report_id
    )

    return {
        "report_id": report_id,
        "total_annotations":
            len(annotations),
        "annotations":
            annotations,
    }