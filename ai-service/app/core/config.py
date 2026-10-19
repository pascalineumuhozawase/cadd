"""
Central configuration for the CADD AI Service.
Reads environment variables with safe defaults.
"""
import os
from pathlib import Path

# ai-service/ is the project root (two parents up from app/core/config.py)
BASE_DIR = Path(__file__).resolve().parents[2]

# Where the trained Keras model lives
MODEL_PATH = Path(
    os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "mobilenetv2_cassava.keras"))
)

# Input image size expected by MobileNetV2
IMG_SIZE = int(os.getenv("IMG_SIZE", "224"))

# Maximum accepted image size
MAX_IMAGE_MB = int(os.getenv("MAX_IMAGE_MB", "8"))

# Reject only very uncertain predictions; calibrate with a representative validation set.
MIN_PREDICTION_CONFIDENCE = float(os.getenv("MIN_PREDICTION_CONFIDENCE", "0.35"))
if not 0 <= MIN_PREDICTION_CONFIDENCE <= 1:
    raise ValueError("MIN_PREDICTION_CONFIDENCE must be between 0 and 1.")

# Ordered class list — MUST match the training label order exactly.
# Kaggle labelmap: 0=cbb, 1=cbsd, 2=cgm, 3=cmd, 4=healthy
CLASS_NAMES = ["CBB", "CBSD", "CGM", "CMD", "healthy"]

# Accepted MIME types for upload
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}