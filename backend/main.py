from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from compress import compress_image
from predict import predict_tumor

app = FastAPI(title="Medical Image Viewer API")

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
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

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # JPEG2000 Compression
    compression_result = compress_image(file_path)

    # ML Prediction
    prediction_result = predict_tumor(file_path)

    return {
        "filename": file.filename,
        "compression": compression_result,
        "prediction": prediction_result,
    }