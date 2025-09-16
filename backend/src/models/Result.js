import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        candidateName: { type: String },
        email: { type: String },
        cvScore: {
            type: Number,
            required: true
        },
        matchedSkills: [{ type: String }],
        missingSkills: [{ type: String }],
        reasoning: { type: String },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job", required: true
        },
    },
    { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
