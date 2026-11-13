import { Router } from "express";
import {
  getStudios,
  getStudioById,
  createStudio,
} from "../controllers/studio.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getStudios);
router.get("/:id", getStudioById);
router.post("/", verifyToken, createStudio);

export default router;