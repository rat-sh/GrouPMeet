import express from "express";
import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes"

const app = express();

app.use(express.json()); // parse incoming json request bodies and make them available on req.body.

app.get("/health", (req, res) => {
    res.send("OK");
})

// title, img => req.body.title, req.body.img
// username, password => req.body.username, req.body.password
// chatid, message => req.body.chatId, req.body.message

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/users", userRoutes);

export default app;
