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

    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"

    report = {
        "report_id": report_id,
        "filename": filename,

        # Patient
        "patient": {
            "patient_name": patient_data.get("patient_name"),
            "patient_id": patient_data.get("patient_id"),
            "age": patient_data.get("age"),
            "gender": patient_data.get("gender"),
            "symptoms": patient_data.get("symptoms"),
        },

        # Doctor
        "doctor": {
            "doctor_name": doctor_data.get("doctor_name"),
            "email": doctor_data.get("email"),
            "department": doctor_data.get("department"),
            "hospital": doctor_data.get("hospital"),
        },

        # Prediction
        "prediction": {
            "result": prediction_data.get("prediction"),
            "confidence": prediction_data.get("confidence"),
        },

        # Compression
        "compression": {
            "compressed_path": compression_data.get("compressed_path"),
            "original_size_mb": compression_data.get("original_size_mb"),
            "compressed_size_mb": compression_data.get("compressed_size_mb"),
            "compression_ratio": compression_data.get("compression_ratio"),
        },

        # ROI
        "annotations": annotations,

        "status": "Final Saved",
        "created_at": datetime.utcnow(),
    }

    reports_collection.insert_one(report)

    return report_id