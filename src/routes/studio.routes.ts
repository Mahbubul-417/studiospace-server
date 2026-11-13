import { Router } from "express";
import {
  getStudios,
  getStudioById,
  createStudio,
  getMyListings,
  updateStudio,
  deleteStudio,
} from "../controllers/studio.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getStudios);

router.get("/my-listings", verifyToken, getMyListings);

router.get("/:id", getStudioById);

router.post("/", verifyToken, createStudio);
router.patch("/:id", verifyToken, updateStudio);
router.delete("/:id", verifyToken, deleteStudio);

export default router;