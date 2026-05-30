from db import reports_collection
from datetime import datetime
import uuid


def save_report(
    filename,
    prediction_data,
    compression_data,
    patient_data,
    doctor_data,
    annotations,
):
    """
    Save complete medical case report:
    Patient + Doctor + Compression + Prediction + ROI + Notes
    """

    # =========================
    # Unique Human-Friendly Report ID
    # =========================
    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"

    # =========================
    # Full Medical Report Document
    # =========================
    report = {
        # Core IDs
        "report_id": report_id,
        "filename": filename,

        # Patient Information
        "patient": {
            "patient_name": patient_data.get("patient_name"),
            "patient_id": patient_data.get("patient_id"),
            "age": patient_data.get("age"),
            "gender": patient_data.get("gender"),
            "symptoms": patient_data.get("symptoms"),
        },

        # Doctor Information
        "doctor": {
            "doctor_name": doctor_data.get("doctor_name"),
            "department": doctor_data.get("department"),
            "hospital": doctor_data.get("hospital"),
        },

        # AI Prediction Section
        "prediction": {
            "result": prediction_data.get("prediction"),
            "confidence": prediction_data.get("confidence"),
        },

        # Compression Section
        "compression": {
            "compressed_path": compression_data.get("compressed_path"),
            "original_size_mb": compression_data.get("original_size_mb"),
            "compressed_size_mb": compression_data.get("compressed_size_mb"),
            "compression_ratio": compression_data.get("compression_ratio"),
        },

        # ROI / Annotation Section
        "annotations": annotations,

        # Metadata
        "status": "Final Saved",
        "created_at": datetime.utcnow(),
    }

    # =========================
    # Insert into MongoDB
    # =========================
    result = reports_collection.insert_one(report)

    return report_id


