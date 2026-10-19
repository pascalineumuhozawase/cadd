import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { pool } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, "../uploads"));
fs.mkdirSync(uploadDir, { recursive: true });
const configuredOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production" &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
    callback(null, !origin || configuredOrigins.includes(origin) || isLocalDevelopmentOrigin);
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT current_database() AS database");
    res.json({ status: "ok", service: "cadd-backend", database: result.rows[0].database });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ status: "error", service: "cadd-backend", message: "Database connection failed" });
  }
});
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }), authRoutes);
app.use("/api/predictions", rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }), predictionRoutes);
app.use("/api/chat", rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false }), chatRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
