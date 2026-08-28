import mongoose from "mongoose";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDatabase = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined in the .env file.");
        }

        console.log("🔄 Attempting MongoDB connection...");

        await mongoose.connect(mongoURI);

        console.log("✅ MongoDB connected successfully.");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};