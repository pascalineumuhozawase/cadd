import fs from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/db.js";
import { predictImage } from "../services/aiService.js";

function normalizePrediction(payload) {
  const p = payload?.prediction || payload?.result || payload?.data || payload || {};
  const diseaseName = p.disease_name || p.disease || p.predicted_class || p.class_name || p.class || "Unknown";
  const confidenceValue = Number(p.confidence ?? p.confidence_score ?? p.score ?? 0);
  const confidence = Number.isFinite(confidenceValue) ? (confidenceValue > 1 ? confidenceValue / 100 : confidenceValue) : 0;
  const recommendation = p.recommendation || p.advice || p.treatment || null;
  const allScores = p.all_scores || p.probabilities || p.scores || null;
  return { diseaseName, confidence: Math.max(0, Math.min(1, confidence)), recommendation, allScores, raw: p };
}

export async function createPrediction(req, res, next) {
  let imagePath;
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required in multipart field 'image'." });
    imagePath = req.file.path;
    const aiPayload = await predictImage(req.file.path, req.file.originalname, req.file.mimetype);
    const prediction = normalizePrediction(aiPayload);

    const result = await pool.query(
      `INSERT INTO predictions
         (user_id, image_path, original_filename, notes, disease_name, confidence, recommendation, all_scores, raw_ai_response)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)
       RETURNING id, user_id, original_filename, notes, disease_name, confidence,
                 recommendation, all_scores, created_at`,
      [
        req.user.id,
        path.basename(imagePath),
        req.file.originalname,
        req.body.notes?.trim() || null,
        prediction.diseaseName,
        prediction.confidence,
        prediction.recommendation,
        JSON.stringify(prediction.allScores),
        JSON.stringify(prediction.raw)
      ]
    );
    const saved = result.rows[0];
    res.status(201).json({
      message: "Image analyzed and diagnosis saved.",
      prediction: {
        id: saved.id,
        disease_name: saved.disease_name,
        confidence: Number(saved.confidence),
        recommendation: saved.recommendation,
        all_scores: saved.all_scores,
        notes: saved.notes,
        created_at: saved.created_at
      }
    });
  } catch (error) {
    // Do not leave a failed-upload image on disk if AI or database processing fails.
    if (imagePath) await fs.unlink(imagePath).catch(() => {});
    next(error);
  }
}

export async function getPredictionHistory(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, original_filename, notes, disease_name, confidence, recommendation, all_scores, created_at
       FROM predictions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 200`,
      [req.user.id]
    );
    res.json({ items: result.rows.map(row => ({ ...row, confidence: Number(row.confidence) })) });
  } catch (error) { next(error); }
}

export async function getPredictionById(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, original_filename, notes, disease_name, confidence, recommendation, all_scores, created_at
       FROM predictions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: "Diagnosis record not found." });
    res.json({ prediction: { ...result.rows[0], confidence: Number(result.rows[0].confidence) } });
  } catch (error) { next(error); }
}
