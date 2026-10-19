
# CADD — Cassava Disease Detection

## 1. Project Overview

**Project Title:** IoT and AI-Powered Cassava Disease Detection System in Rwanda

CADD is a web-based and AI-powered system designed to help farmers and agricultural experts identify cassava leaf diseases using image classification.

The system allows users to upload cassava leaf images, receive AI-generated predictions, view diagnosis history, and interact with an AI chatbot for cassava disease information and agricultural advice.

## 2. Main Objectives

- Detect cassava leaf diseases using Artificial Intelligence.
- Provide disease predictions from uploaded images.
- Store users and diagnosis history in PostgreSQL.
- Provide agricultural advice through an AI chatbot.
- Support future IoT sensor integration.
- Make cassava disease information accessible to farmers in Rwanda.

## 3. Technology Stack

### Frontend
- React / Next.js
- JavaScript
- HTML and CSS
- Tailwind CSS

### Backend
- Node.js
- Express.js
- JWT authentication
- REST API

### AI Service
- Python
- FastAPI
- TensorFlow / Keras
- MobileNetV2 image classification

### Database
- PostgreSQL
- pgvector (optional, for vector search)

### Deployment
- Docker
- Docker Compose

## 4. Cassava Disease Classes

The intended model classes are:

1. CBB — Cassava Bacterial Blight
2. CBSD — Cassava Brown Streak Disease
3. CGM — Cassava Green Mottle
4. CMD — Cassava Mosaic Disease
5. Healthy — Healthy cassava leaves

The model must be trained or configured with these classes in the correct order.

## 5. Project Structure

```text
CADD/
├── frontend/
├── backend/
├── ai-service/
├── database/
├── rag-service/
├── scripts/
├── docs/
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 6. Prerequisites

Install the following software:

- Node.js and npm
- Python 3.10 or a version supported by your AI dependencies
- PostgreSQL
- Docker Desktop (optional, for containerized deployment)
- Git

## 7. Environment Configuration

Create the environment files required by each service.

Examples:

- `backend/.env`
- `frontend/.env.local`
- `ai-service/.env` (if required)

Use the corresponding `.env.example` files as templates.

Never commit passwords, API keys, JWT secrets, or other credentials to Git.

## 8. Database Setup

1. Start PostgreSQL.
2. Create a database named `cadd_db`.
3. Execute the SQL schema in `database/schema.sql`.
4. Apply any required seed files and migrations.

Example using PostgreSQL command-line tools:

```bash
createdb -U postgres cadd_db
psql -U postgres -d cadd_db -f database/schema.sql
```

These commands require PostgreSQL command-line tools and a running database server.

## 9. Run the AI Service

Open a terminal:

```bash
cd ai-service
python -m venv venv
```

Activate the virtual environment.

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the service, assuming `app/main.py` defines a FastAPI application named `app`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API documentation should be available at:

http://localhost:8000/docs

A trained model must be provided before real predictions can work.
To retrain the five cassava classes, run `python train_model.py` from `ai-service/notebooks`. For reliable non-cassava rejection, the training data also needs labeled non-cassava images and a corresponding extra class before retraining.
Predictions below `MIN_PREDICTION_CONFIDENCE` (default `0.35`) are rejected as uncertain. This threshold is only a safeguard: a non-cassava image that receives a high score can still be misclassified because the model was trained only on cassava classes. Reliable rejection requires adding non-cassava training images and retraining/calibrating the model.

## 10. Run the Backend

Open another terminal from the project root:

```bash
cd CADD-Backend
npm install
```

Configure `backend/.env` before starting the server.

Start the backend using the script defined in `backend/package.json`, for example:

```bash
npm run dev
```

The backend should connect to PostgreSQL and communicate with the AI service using configured URLs.

## 11. Run the Frontend

Open another terminal from the project root:

```bash
cd CADD-Frontend
npm install
```

Configure the frontend API URL using the variable expected by your frontend code.

Set the Vite API URL in `CADD-Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, commonly:

http://localhost:5173

## 12. Run with Docker Compose

From the project root, copy `.env.example` to `.env` and replace both placeholder secrets with strong values. Then run:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:3000`, the backend at `http://localhost:5000`, and the AI service at `http://localhost:8000`. Compose initializes PostgreSQL from `CADD-Backend/database/schema.sql` on the first database start.

The included Compose configuration must match the actual code in each service.

## 13. Security and Reliability

- Validate uploaded image types and file sizes.
- Protect private API endpoints with authentication.
- Keep credentials in environment variables.
- Avoid exposing database ports publicly in production.
- Validate AI predictions and handle model errors.
- Treat AI results as decision support, not a guaranteed agricultural diagnosis.
- Back up the database regularly.

## 14. Current Development Status

The project may require additional implementation and testing before all services work together.

In particular, verify:

- Database connectivity.
- Frontend-to-backend communication.
- Backend-to-AI-service communication.
- Model loading and prediction accuracy.
- Chatbot retrieval and response generation.
- Authentication and diagnosis-history storage.
- Docker Compose health checks and startup order.

## 15. Future Improvements

- Integrate ESP32-based environmental sensors.
- Add sensor data visualization.
- Support additional local languages.
- Deploy the application to a cloud server.
- Improve model performance using validated cassava datasets.

## License

Add an appropriate license before publicly distributing the project.
