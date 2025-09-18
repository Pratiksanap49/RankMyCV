// src/controllers/resultController.js
import Result from "../models/result.js";
import { rankCVWithGroq } from "../services/groqService.js";
import { createObjectCsvWriter } from "csv-writer";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

// Rank CVs and save results
export const rankCVs = async (req, res) => {
    try {
        const { jobDescription, cvs, requiredKeywords } = req.body;

        if (!jobDescription || !cvs?.length) {
            return res.status(400).json({ message: "Job description and CVs are required" });
        }

        const results = [];

        for (const cv of cvs) {
            const analysis = await rankCVWithGroq(jobDescription, cv.content, requiredKeywords);

            const result = await Result.create({
                user: req.user.id,
                jobDescription,
                cvName: cv.name,
                cvText: cv.content,
                semanticScore: analysis.semanticScore,
                keywordScore: analysis.keywordScore,
                finalScore: analysis.finalScore,
                reason: analysis.reason,
                matchedKeywords: analysis.matchedKeywords,
                missingKeywords: analysis.missingKeywords,
            });

            results.push({
                id: result._id,
                cvName: result.cvName,
                semanticScore: result.semanticScore,
                keywordScore: result.keywordScore,
                finalScore: result.finalScore,
                reason: result.reason,
                matchedKeywords: result.matchedKeywords,
                missingKeywords: result.missingKeywords,
            });
        }

        res.json(results.sort((a, b) => b.finalScore - a.finalScore));
    } catch (err) {
        console.error("❌ Ranking error:", err.message);
        res.status(500).json({ message: "Failed to rank CVs" });
    }
};

// Export one ranking session to CSV
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

        const records = [
            {
                cvName: result.cvName,
                semanticScore: result.semanticScore,
                keywordScore: result.keywordScore,
                finalScore: result.finalScore,
                reason: result.reason || "",
                matchedKeywords: (result.matchedKeywords || []).join(", "),
                missingKeywords: (result.missingKeywords || []).join(", "),
            }
        ];

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

// Export one ranking session to PDF
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
        doc.moveDown();

        doc.fontSize(14).text(`Candidate: ${result.cvName}`, { underline: true });
        doc.fontSize(12).text(`Semantic Score: ${result.semanticScore}`);
        doc.text(`Keyword Score: ${result.keywordScore}`);
        doc.text(`Final Score: ${result.finalScore}`);
        doc.text(`Reason: ${result.reason || ""}`);
        doc.text(`Matched Keywords: ${(result.matchedKeywords || []).join(", ")}`);
        doc.text(`Missing Keywords: ${(result.missingKeywords || []).join(", ")}`);
        doc.moveDown();

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
