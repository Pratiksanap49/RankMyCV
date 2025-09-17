import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        jobDescription: {
            type: String,
            required: true,
        },
        requiredKeywords: [String],
        cvs: [
            {
                fileName: String,
                score: Number,
                matchedKeywords: [String],
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Result", resultSchema);

