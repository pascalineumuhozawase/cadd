FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV MODEL_PATH=/app/models/mobilenetv2_cassava.keras
ENV IMG_SIZE=224
ENV MAX_IMAGE_MB=8

WORKDIR /app

# libgomp1 is required by TensorFlow on Debian slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY models ./models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]