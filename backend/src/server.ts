import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";


import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Needed because this project uses ES modules

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

// ================================
// API ROUTES
// ================================

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Capital Bank of Canada API is running.",
    });
});

// ================================
// FRONTEND
// ================================

const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

// React Router fallback
app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// ================================
// DATABASE + SERVER
// ================================

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Capital Bank API running on port ${PORT}`);
        });
    })
    .catch((error: unknown) => {
        console.error("Failed to start Capital Bank API:", error);
    });