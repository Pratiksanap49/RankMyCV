import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        jobTitle: { type: String },
        jobDescription: {
            type: String,
            required: true
        },
        keywords: [{ type: String }],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", required: true
        },
    },
    { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
