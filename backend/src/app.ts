import express from "express";
import path from "path"
import { clerkMiddleware } from '@clerk/express'

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import groupRoutes from "./routes/groupRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import emailRoutes from "./routes/emailRoutes";
import { errorHandler } from "./middleware/errorHandler";

import cors from "cors";

const app = express();

app.use(cors({
    origin: [
        "http://localhost:8081", 
        "http://localhost:5173", 
        process.env.FRONTEND_URL!
    ].filter(Boolean),
    credentials: true,
}));

app.use(express.json()); // parse incoming json request bodies and make them available on req.body.

// auth
// any request should first go through clerk middleware to verify the token
app.use(clerkMiddleware())

app.get("/health", (req, res) => {
    res.send("OK");
})

// title, img => req.body.title, req.body.img

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/emails", emailRoutes);

// Serve uploads directory publicly
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

if(process.env.NODE_ENV === "production"){
    const webDist = process.env.WEB_DIST_PATH ?? path.join(__dirname,"../../web/dist");
    app.use(express.static(webDist));

    app.get(/.*/, (_, res) => {
        res.sendFile(path.join(webDist, "index.html"));
    });
}

// errorHandler must always be last
app.use(errorHandler);

export default app;
