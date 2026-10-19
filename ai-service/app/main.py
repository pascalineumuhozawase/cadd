"""
CADD AI Service entry point.
Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.ml.model_loader import load_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model once when the service starts
    load_model()
    yield


app = FastAPI(
    title="CADD — Cassava Disease Detection API",
    description=(
        "MobileNetV2-based classification of cassava leaf images into "
        "CBB, CBSD, CGM, CMD, and healthy."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Node.js backend and the React dev server to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        "http://localhost:3000",
        "*",  # relax during development; tighten in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["system"])
def root():
    return {
        "message": "CADD AI Service is running",
        "docs": "/docs",
        "health": "/health",
        "predict": "/predict",
    }