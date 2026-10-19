# CADD Node.js Backend

Express API for CADD (Cassava Disease Detection). Includes:
- Registration, login, bcrypt password hashing, and JWT authentication
- PostgreSQL storage for user accounts and diagnosis results
- Authenticated cassava leaf image upload (JPG, PNG, WEBP; configurable maximum size)
- HTTP communication with an external AI service
- User-specific diagnosis history
- Authenticated chatbot endpoint proxy
- CORS, Helmet, rate limits, and centralized error handling

## Requirements
- Node.js 18+ (uses built-in `fetch`, `FormData`, and `Blob`)
- PostgreSQL
- The separate AI service (default URL `http://localhost:8000`)

## 1. Create the database
Create a PostgreSQL database named `cadd_db` using pgAdmin or a terminal. Example:

```bash
createdb cadd_db
```

Run the schema:

```bash
psql -d cadd_db -f database/schema.sql
```

If you use pgAdmin, open `database/schema.sql` in the Query Tool connected to `cadd_db` and execute it.

## 2. Configure environment variables
Copy `.env.example` to `.env` and update at least these values:

```env
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cadd_db
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
AI_SERVICE_URL=http://localhost:8000
```

Never commit `.env` or expose `JWT_SECRET` in the React frontend.

## 3. Install and run

```bash
npm install
npm run db:check
npm run dev
```

The API should be available at `http://localhost:5000`. Health check:
`http://localhost:5000/api/health`

For production, use `npm start` behind HTTPS and configure backups, log handling, upload retention, and a strong secret.

## API endpoints

All routes are prefixed by `/api`.

| Method | Endpoint | Auth? | Purpose |
|---|---|---:|---|
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Create user account |
| POST | `/auth/login` | No | Return JWT and profile |
| GET | `/auth/me` | Yes | Current profile |
| POST | `/predictions` | Yes | Upload image and request AI diagnosis |
| GET | `/predictions` | Yes | List current user's diagnosis records |
| GET | `/predictions/:id` | Yes | Fetch one of the user's records |
| POST | `/chat` | Yes | Send question to the CADD assistant |

### Image upload contract
Send `multipart/form-data` with:
- `image`: file (required)
- `notes`: optional text

The Node backend forwards the image to `POST {AI_SERVICE_URL}/predict` using multipart field `file`. It expects JSON response fields such as `disease_name` or `predicted_class`, `confidence`, and optional `recommendation` / `all_scores`. If your AI service uses another route, multipart field name, or response shape, update `src/services/aiService.js` and the normalizer in `src/controllers/predictionController.js`.

### Chat contract
The backend currently returns a local informational response for `{ "message": "...", "history": [...] }`; the FastAPI service does not expose a chat endpoint. Chat requires the same bearer token as other workspace routes.

## Connect to the React frontend
In the React project's `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The frontend sends the JWT as `Authorization: Bearer <token>` after login/register.

## Security and deployment notes
- Uploaded files are stored in `uploads/` using generated filenames; original filenames are not used as paths.
- Only declared image MIME types are accepted. For production, add file signature/content validation and consider image decoding/re-encoding before inference.
- The current implementation keeps uploaded images on disk after successful predictions. Set a retention/deletion policy appropriate for your users and privacy obligations.
- The chatbot route requires login. If you want a public chatbot, deliberately change the route policy and rate limits.
- The backend does not include the AI model itself. The AI service must be implemented and running separately.
- Do not assume model predictions are definitive. Farmers should consult an agronomist for uncertain or severe symptoms.
