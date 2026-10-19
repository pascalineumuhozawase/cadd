"""
Loads and caches the trained MobileNetV2 Keras model.
The model is loaded once at FastAPI startup.
"""
import tensorflow as tf

from app.core.config import MODEL_PATH

_model = None


def load_model():
    """Load the Keras model once and cache it in a module-level variable."""
    global _model

    if _model is not None:
        return _model

    if not MODEL_PATH.exists():
        print(f"[CADD] WARNING: Model file not found at {MODEL_PATH}")
        print("[CADD] Train a model and place it at that path, "
              "or set MODEL_PATH to the correct location.")
        return None

    try:
        _model = tf.keras.models.load_model(MODEL_PATH)
        print(f"[CADD] MobileNetV2 model loaded from: {MODEL_PATH}")
        print(f"[CADD] Output shape: {_model.output_shape}")
        return _model
    except Exception as exc:
        print(f"[CADD] ERROR loading model: {exc}")
        return None


def get_model():
    """Return the currently loaded model (may be None)."""
    return _model