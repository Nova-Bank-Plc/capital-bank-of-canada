import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "Capital Bank of Canada API is running.",
    });
});

connectDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`?? Capital Bank API running on port ${PORT}`);
        });
    })
    .catch((error: unknown) => {
        console.error("? Failed to start Capital Bank API:", error);
    });
