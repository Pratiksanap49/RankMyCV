// src/routes/resultRoutes.js
import express from "express";
import { rankCVs, exportResultPDF, exportResultCSV, getMyResults, getResultById, deleteResult } from "../controllers/resultController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Rank CVs → creates a new session (protected)
router.post("/rank", authMiddleware, rankCVs);

// Get all my ranking sessions (protected)
router.get("/my-results", authMiddleware, getMyResults);

// Get a single session detail
router.get("/:id", authMiddleware, getResultById);

// Delete a session
router.delete("/:id", authMiddleware, deleteResult);

// Export a session
router.get("/:id/export/csv", authMiddleware, exportResultCSV);
router.get("/:id/export/pdf", authMiddleware, exportResultPDF);

export default router;
