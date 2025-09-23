import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/results", resultRoutes);

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend running 🚀" });
});

// DB connection
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log("✅ MongoDB connected");
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error("❌ MongoDB connection error:", err));
