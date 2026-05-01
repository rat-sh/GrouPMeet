import mongoose from "mongoose";

export const connectDB = async () => {
    try {

        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("MONGODB_URI is not defined");
        }

        console.log("⏳ Connecting to MongoDB...");

        await mongoose.connect(mongoURI);

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