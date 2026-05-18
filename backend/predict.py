import numpy as np
import cv2
from tensorflow.keras.models import load_model

# Load trained model once
model = load_model("tumor_model.h5")

IMG_SIZE = 224


def preprocess_image(image_path: str):
    # Read image
    image = cv2.imread(image_path)

    if image is None:
        raise ValueError("Invalid image file")

    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Resize
    image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))

    # Normalize
    image = image / 255.0

    # Add batch dimension
    image = np.expand_dims(image, axis=0)

    return image


def predict_tumor(image_path: str):
    processed_image = preprocess_image(image_path)

    # Model prediction
    prediction = model.predict(processed_image, verbose=0)[0][0]

    # Binary classification
    if prediction >= 0.5:
        result = "Tumor"
        confidence = round(float(prediction) * 100, 2)
    else:
        result = "No Tumor"
        confidence = round((1 - float(prediction)) * 100, 2)

    return {
        "prediction": result,
        "confidence": confidence
    }



