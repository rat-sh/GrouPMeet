import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI as string, {
            tlsInsecure: true,
            serverSelectionTimeoutMS: 10000, // fail after 10s instead of hanging
            connectTimeoutMS: 10000,
            socketTimeoutMS: 10000,
        });
        console.log("✅ MongoDB connected successfully!");
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   DB  : ${mongoose.connection.name}`);

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️  MongoDB disconnected!");
        });
        mongoose.connection.on("error", (err) => {
            console.error("❌ MongoDB error:", err);
        });
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}