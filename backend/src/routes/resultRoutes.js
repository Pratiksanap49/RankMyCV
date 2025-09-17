import express from "express";
import Result from "../models/Result.js";
import authMiddleware from "../middleware/auth.js"; // ✅ fixed

const router = express.Router();

// Save result
router.post("/save", authMiddleware, async (req, res) => {
    try {
        const { jobDescription, requiredKeywords, cvs } = req.body;

        if (!jobDescription || !requiredKeywords || !cvs) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = new Result({
            userId: req.user.id,
            jobDescription,
            requiredKeywords,
            cvs,
        });

        await result.save();
        res.status(201).json({ message: "Result saved successfully", result });
    } catch (err) {
        console.error("❌ Error saving result:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Get results
router.get("/my-results", authMiddleware, async (req, res) => {
    try {
        const results = await Result.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(results);
    } catch (err) {
        console.error("❌ Error fetching results:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
