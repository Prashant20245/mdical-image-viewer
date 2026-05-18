from db import reports_collection
from datetime import datetime


def save_report(filename, prediction_data, compression_data):
    report = {
        "filename": filename,
        "prediction": prediction_data.get("prediction"),
        "confidence": prediction_data.get("confidence"),
        "compressed_path": compression_data.get("compressed_path"),
        "original_size_mb": compression_data.get("original_size_mb"),
        "compressed_size_mb": compression_data.get("compressed_size_mb"),
        "compression_ratio": compression_data.get("compression_ratio"),
        "created_at": datetime.utcnow()
    }

    result = reports_collection.insert_one(report)

    return str(result.inserted_id)