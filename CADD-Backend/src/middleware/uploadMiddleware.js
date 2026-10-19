import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads"));
fs.mkdirSync(uploadDir, { recursive: true });

const maxBytes = Number(process.env.MAX_IMAGE_MB || 10) * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extByType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extByType[file.mimetype] || ".img"}`);
  }
});

export const uploadLeafImage = multer({
  storage,
  limits: { fileSize: maxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(Object.assign(new Error("Only JPG, PNG, and WEBP images are allowed."), { status: 400 }));
    cb(null, true);
  }
}).single("image");
