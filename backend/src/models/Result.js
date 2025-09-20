// src/models/resultModel.js
import mongoose from "mongoose";

// Nested schema for each CV in a session
const cvSchema = new mongoose.Schema({
    cvName: { type: String, required: true },
    cvText: { type: String, required: true },
    semanticScore: { type: Number, min: 0, max: 100, required: true },
    keywordScore: { type: Number, min: 0, max: 100, required: true },
    finalScore: { type: Number, min: 0, max: 100, required: true },
    reason: { type: String },
    matchedKeywords: [String],
    missingKeywords: [String],
});

const resultSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        jobDescription: { type: String, required: true },
        requiredKeywords: [String],
        cvs: [cvSchema], //  all CVs for this session
    },
    { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
