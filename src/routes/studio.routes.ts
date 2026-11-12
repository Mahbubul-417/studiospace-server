import { Router } from "express";
import {
  getStudios,
  getStudioById,
  createStudio,
} from "../controllers/studio.controller.js";

const router = Router();

router.get("/", getStudios);
router.get("/:id", getStudioById);
router.post("/", createStudio);

export default router;