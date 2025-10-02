// src/controllers/resultController.js
import Result from "../models/result.js";
import { rankCVWithGroq } from "../services/groqService.js";
import { createObjectCsvWriter } from "csv-writer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

// Rank CVs and save session
export const rankCVs = async (req, res) => {
    try {
        const { jobDescription, cvs, requiredKeywords } = req.body;

        if (!jobDescription || !cvs?.length || !requiredKeywords?.length) {
            return res.status(400).json({ message: "Job description, CVs, and keywords are required" });
        }

        const analyzedCVs = [];

        for (const cv of cvs) {
            const analysis = await rankCVWithGroq(jobDescription, cv.content, requiredKeywords);

            analyzedCVs.push({
                cvName: cv.name,
                cvText: cv.content,
                semanticScore: analysis.semanticScore,
                keywordScore: analysis.keywordScore,
                finalScore: analysis.finalScore,
                reason: analysis.reason,
                matchedKeywords: analysis.matchedKeywords,
                missingKeywords: analysis.missingKeywords,
                sourceId: cv.sourceId || null,
            });
        }

        analyzedCVs.sort((a, b) => b.finalScore - a.finalScore);

        // Save session
        const result = await Result.create({
            user: req.user.id,
            jobDescription,
            requiredKeywords,
            cvs: analyzedCVs,
        });

        // Return sorted CVs for frontend
        res.json({
            sessionId: result._id.toString(),
            jobDescription: result.jobDescription,
            requiredKeywords: result.requiredKeywords,
            cvs: analyzedCVs.sort((a, b) => b.finalScore - a.finalScore),
            createdAt: result.createdAt,
        });
    } catch (err) {
        console.error("❌ Ranking error:", err.message);
        res.status(500).json({ message: "Failed to rank CVs" });
    }
};

// Export session to CSV
export const exportResultCSV = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findById(id);

        if (!result || result.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Result not found" });
        }

        const filePath = path.join("exports", `result_${id}.csv`);
        if (!fs.existsSync("exports")) fs.mkdirSync("exports");

        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: "cvName", title: "CV Name" },
                { id: "semanticScore", title: "Semantic Score" },
                { id: "keywordScore", title: "Keyword Score" },
                { id: "finalScore", title: "Final Score" },
                { id: "reason", title: "Reason" },
                { id: "matchedKeywords", title: "Matched Keywords" },
                { id: "missingKeywords", title: "Missing Keywords" },
            ],
        });

        const records = result.cvs.map(cv => ({
            cvName: cv.cvName,
            semanticScore: cv.semanticScore,
            keywordScore: cv.keywordScore,
            finalScore: cv.finalScore,
            reason: cv.reason || "",
            matchedKeywords: (cv.matchedKeywords || []).join(", "),
            missingKeywords: (cv.missingKeywords || []).join(", "),
        }));

        await csvWriter.writeRecords(records);

        res.download(filePath, (err) => {
            if (err) console.error("❌ Error downloading CSV:", err);
            fs.unlinkSync(filePath);
        });
    } catch (err) {
        console.error("❌ Error exporting CSV:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Export session to PDF
export const exportResultPDF = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findById(id);

        if (!result || result.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Result not found" });
        }

        const filePath = path.join("exports", `result_${id}.pdf`);
        if (!fs.existsSync("exports")) fs.mkdirSync("exports");

        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(filePath));

        doc.fontSize(18).text("CV Ranking Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Job Description: ${result.jobDescription}`);
        doc.text(`Required Keywords: ${result.requiredKeywords.join(", ")}`);
        doc.moveDown();

        result.cvs.forEach((cv, index) => {
            doc.fontSize(14).text(`Candidate ${index + 1}: ${cv.cvName}`, { underline: true });
            doc.fontSize(12).text(`Semantic Score: ${cv.semanticScore}`);
            doc.text(`Keyword Score: ${cv.keywordScore}`);
            doc.text(`Final Score: ${cv.finalScore}`);
            doc.text(`Reason: ${cv.reason || ""}`);
            doc.text(`Matched Keywords: ${(cv.matchedKeywords || []).join(", ")}`);
            doc.text(`Missing Keywords: ${(cv.missingKeywords || []).join(", ")}`);
            doc.moveDown();
        });

        doc.end();

        doc.on("finish", () => {
            res.download(filePath, (err) => {
                if (err) console.error("❌ Error downloading PDF:", err);
                fs.unlinkSync(filePath);
            });
        });
    } catch (err) {
        console.error("❌ Error exporting PDF:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();

        const summaries = results.map((result) => {
            const sortedCVs = [...(result.cvs || [])].sort((a, b) => b.finalScore - a.finalScore);
            const topCandidate = sortedCVs[0];
            return {
                id: result._id.toString(),
                createdAt: result.createdAt,
                jobDescription: result.jobDescription,
                requiredKeywords: result.requiredKeywords,
                candidateCount: sortedCVs.length,
                topCandidate: topCandidate ? {
                    name: topCandidate.cvName,
                    finalScore: topCandidate.finalScore,
                } : null,
            };
        });

        res.json(summaries);
    } catch (err) {
        console.error("❌ Error fetching results:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getResultById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Result.findById(id).lean();

        if (!result || result.user.toString() !== req.user.id) {
            return res.status(404).json({ message: "Result not found" });
        }

        const sortedCvs = [...(result.cvs || [])].sort((a, b) => b.finalScore - a.finalScore);

        res.json({
            sessionId: result._id.toString(),
            jobDescription: result.jobDescription,
            requiredKeywords: result.requiredKeywords,
            cvs: sortedCvs,
            createdAt: result.createdAt,
        });
    } catch (err) {
        console.error("❌ Error fetching result by id:", err);
        res.status(500).json({ message: "Server error" });
    }
};
