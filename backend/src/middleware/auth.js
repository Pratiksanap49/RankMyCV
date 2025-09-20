// src/middleware/auth.js
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user ID to request
        req.user = { id: decoded.id };

        next();
    } catch (err) {
        console.error("❌ JWT verification failed:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
