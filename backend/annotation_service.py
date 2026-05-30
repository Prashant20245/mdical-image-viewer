from db import db
from datetime import datetime

annotations_collection = db["annotations"]


def save_annotation(report_id, roi_id, x, y, width, height, note):
    annotation_data = {
        "report_id": report_id,
        "roi_id": roi_id,
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        "note": note,
        "created_at": datetime.utcnow(),
    }

    result = annotations_collection.insert_one(annotation_data)

    return str(result.inserted_id)


def get_annotations_by_report(report_id):
    annotations = list(
        annotations_collection.find(
            {"report_id": report_id},
            {"_id": 0}
        )
    )

    return annotations