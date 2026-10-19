# CADD React Frontend

React + Vite user interface for **CADD (Cassava Disease Detection)**. It includes:
- Farmer/agronomist registration and login
- Dashboard and cassava disease quick-reference cards
- Cassava leaf image upload/camera capture and diagnosis result
- Historical diagnosis records
- Chatbot interface for cassava health questions
- Responsive desktop and mobile layouts

## 1. Requirements
- Node.js 18 or newer
- npm
- The CADD backend running separately for real authentication, diagnosis, history and chatbot responses

## 2. Install and run

Open a terminal in this folder:

```bash
npm install
```

Copy `.env.example` to `.env` and set your backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Build for production:

```bash
npm run build
npm run preview
```

## 3. Backend API contract

The UI currently expects these endpoints (adjust `src/services/api.js` if your backend uses different paths or response shapes):

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a user |
| POST | `/auth/login` | Authenticate user; should return a token and user |
| POST | `/predictions` | Upload a leaf image using multipart field `image`; optional `notes` |
| GET | `/predictions` | Return the signed-in user's diagnosis history |
| POST | `/chat` | Send `{ "message": "...", "history": [...] }` and return an answer |

The frontend sends a bearer token in the `Authorization` header when a token is returned by login/register. If your existing backend uses different routes or payload fields, update the API functions and request/response mapping in `src/services/api.js`.

## 4. Important notes
- Diagnosis cards support common response fields such as `disease_name`, `disease`, `predicted_class`, `confidence`, `confidence_score`, `recommendation`, and `advice`. Map these to your backend's actual response format if needed.
- A real diagnosis, saved history, authentication, and chatbot require a running backend and trained AI model. This frontend does not include or train the model.
- Keep API secrets in the backend, never in a `VITE_` frontend environment variable.
- AI predictions are screening guidance, not a replacement for professional agronomist assessment.
