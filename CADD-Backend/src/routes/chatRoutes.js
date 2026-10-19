import { Router } from "express";
import { chat } from "../controllers/chatController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();
router.use(authenticate);
router.post("/", chat);

export default router;