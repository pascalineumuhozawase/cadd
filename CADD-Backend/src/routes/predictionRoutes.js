import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { uploadLeafImage } from "../middleware/uploadMiddleware.js";
import { createPrediction, getPredictionById, getPredictionHistory } from "../controllers/predictionController.js";

const router = Router();
router.use(authenticate);
router.post("/", uploadLeafImage, createPrediction);
router.get("/", getPredictionHistory);
router.get("/:id", getPredictionById);
export default router;
