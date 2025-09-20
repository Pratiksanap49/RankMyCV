// src/routes/resultRoutes.js
import express from "express";
import { rankCVs, exportResultPDF, exportResultCSV } from "../controllers/resultController.js";
import authMiddleware from "../middleware/auth.js";
import Result from "../models/result.js";

const router = express.Router();

// Rank CVs → creates a new session (protected)
router.post("/rank", authMiddleware, rankCVs);

// Get all my ranking sessions (protected)
router.get("/my-results", authMiddleware, async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error("❌ Error fetching results:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Export a session
router.get("/:id/export/csv", authMiddleware, exportResultCSV);
router.get("/:id/export/pdf", authMiddleware, exportResultPDF);

export default router;
