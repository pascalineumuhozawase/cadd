"""
HTTP routes for the CADD AI Service.
"""
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import ALLOWED_CONTENT_TYPES, MAX_IMAGE_MB, CLASS_NAMES
from app.ml.model_loader import get_model
from app.services.prediction_service import predict_cassava_disease

router = APIRouter()


@router.get("/health", tags=["system"])
def health_check():
    """Liveness + model-load check."""
    return {
        "status": "ok",
        "service": "CADD AI Service",
        "model_loaded": get_model() is not None,
        "classes": CLASS_NAMES,
    }


@router.get("/classes", tags=["system"])
def list_classes():
    """Return the supported disease classes."""
    return {"classes": CLASS_NAMES}


@router.post("/predict", tags=["prediction"])
async def predict(file: UploadFile = File(...)):
    """Classify a cassava leaf image."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are accepted.",
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")

    max_bytes = MAX_IMAGE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image size must not exceed {MAX_IMAGE_MB} MB.",
        )

    return predict_cassava_disease(image_bytes)