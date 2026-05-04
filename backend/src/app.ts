import express from "express";
import { clerkMiddleware } from '@clerk/express'

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import groupRoutes from "./routes/groupRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes"
import { errorHandler } from "./middleware/errorHandler";

const app = express();

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

app.use(errorHandler)

export default app;
