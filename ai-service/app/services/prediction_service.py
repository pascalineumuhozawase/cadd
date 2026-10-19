"""
Core prediction logic: preprocess an image and run the MobileNetV2 model.
"""
import io

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException

from app.core.config import CLASS_NAMES, IMG_SIZE
from app.ml.model_loader import get_model

# We define the threshold directly here for safety
MIN_CONFIDENCE = 0.60 

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Decode, resize, normalize, and add a batch dimension."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid image. Upload a JPG, PNG, or WEBP file.",
        )

    image = image.resize((IMG_SIZE, IMG_SIZE))
    image_array = np.asarray(image, dtype=np.float32)
    
    # MobileNetV2 expects pixels normalized to [-1, 1]
    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(image_array)

    # Shape: (1, 224, 224, 3)
    return np.expand_dims(image_array, axis=0)


def _select_prediction(probabilities: np.ndarray) -> dict:
    if len(probabilities) != len(CLASS_NAMES):
        raise HTTPException(
            status_code=500,
            detail=f"Model output has {len(probabilities)} classes, but {len(CLASS_NAMES)} were expected.",
        )

    predicted_index = int(np.argmax(probabilities))
    confidence = float(probabilities[predicted_index])

    # 🛑 SAFETY CHECK: If it's not cassava, return an "Unknown" message
    # Instead of raising an error, we return a successful response with "Unknown"
    if confidence < MIN_CONFIDENCE:
        return {
            "predicted_class": "Unknown",
            "confidence": round(confidence, 4),
            "message": "The model is uncertain. Please ensure this is a clear photo of a cassava leaf.",
            "probabilities": {
                name: round(float(probabilities[i]), 4)
                for i, name in enumerate(CLASS_NAMES)
            },
            "model": "MobileNetV2",
        }

    # Normal prediction
    return {
        "predicted_class": CLASS_NAMES[predicted_index],
        "confidence": round(confidence, 4),
        "probabilities": {
            name: round(float(probabilities[i]), 4)
            for i, name in enumerate(CLASS_NAMES)
        },
        "model": "MobileNetV2",
    }


def predict_cassava_disease(image_bytes: bytes) -> dict:
    """Return the predicted class and per-class probabilities."""
    model = get_model()

    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI model is not loaded. Place a trained .keras file in models/ and restart the service.",
        )

    image_batch = preprocess_image(image_bytes)
    probabilities = model.predict(image_batch, verbose=0)[0]
    
    return _select_prediction(probabilities)