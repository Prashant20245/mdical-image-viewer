from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from compress import compress_image
from predict import predict_tumor
from report_service import save_report
from db import reports_collection

app = FastAPI(title="Medical Image Viewer API")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Medical Image Viewer Backend Running"}


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # STEP 1 — Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # STEP 2 — Compression
    compression_result = compress_image(file_path)

    # STEP 3 — Prediction
    prediction_result = predict_tumor(file_path)

    # STEP 4 — Save report to MongoDB
    report_id = save_report(
        filename=file.filename,
        prediction_data=prediction_result,
        compression_data=compression_result,
    )

    # STEP 5 — Return response
    return {
        "filename": file.filename,
        "compression": compression_result,
        "prediction": prediction_result,
        "report_id": report_id,
    }


# STEP 6 — Fetch All Reports History
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


# from fastapi import FastAPI, UploadFile, File
# from fastapi.middleware.cors import CORSMiddleware
# import shutil
# import os

# from compress import compress_image
# from predict import predict_tumor
# from report_service import save_report

# app = FastAPI(title="Medical Image Viewer API")

# # CORS for Next.js frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Development only
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# @app.get("/")
# def home():
#     return {"message": "Medical Image Viewer Backend Running"}


# @app.post("/analyze")
# async def analyze_image(file: UploadFile = File(...)):
#     file_path = os.path.join(UPLOAD_DIR, file.filename)

#     # STEP 1 — Save uploaded file
#     with open(file_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)

#     # STEP 2 — Compression
#     compression_result = compress_image(file_path)

#     # STEP 3 — Prediction
#     prediction_result = predict_tumor(file_path)

#     # STEP 4 — Save report to MongoDB
#     report_id = save_report(
#         filename=file.filename,
#         prediction_data=prediction_result,
#         compression_data=compression_result,
#     )

#     # STEP 5 — Return response
#     return {
#         "filename": file.filename,
#         "compression": compression_result,
#         "prediction": prediction_result,
#         "report_id": report_id,
#     }


# # from fastapi import FastAPI, UploadFile, File
# # from fastapi.middleware.cors import CORSMiddleware
# # import shutil
# # import os

# # from compress import compress_image
# # from predict import predict_tumor

# # app = FastAPI(title="Medical Image Viewer API")

# # # CORS for Next.js frontend
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=["*"],  # For development only
# #     allow_credentials=True,
# #     allow_methods=["*"],
# #     allow_headers=["*"],
# # )

# # UPLOAD_DIR = "uploads"
# # os.makedirs(UPLOAD_DIR, exist_ok=True)


# # @app.get("/")
# # def home():
# #     return {"message": "Medical Image Viewer Backend Running"}


# # @app.post("/analyze")
# # async def analyze_image(file: UploadFile = File(...)):
# #     file_path = os.path.join(UPLOAD_DIR, file.filename)

# #     # Save uploaded file
# #     with open(file_path, "wb") as buffer:
# #         shutil.copyfileobj(file.file, buffer)

# #     # JPEG2000 Compression
# #     compression_result = compress_image(file_path)

# #     # ML Prediction
# #     prediction_result = predict_tumor(file_path)

# #     return {
# #         "filename": file.filename,
# #         "compression": compression_result,
# #         "prediction": prediction_result,
# #     }