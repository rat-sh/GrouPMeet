import { Server as SocketServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";

// store online users in memory: userId -> Set<socketId>
// Using a Set supports multi-device / multi-tab connections per user.
export const onlineUsers: Map<string, Set<string>> = new Map();

// Reverse map for fast userId lookup on disconnect: socketId -> userId
const socketUserMap: Map<string, string> = new Map();

export const initializeSocket = (httpServer: HttpServer) => {
    const allowedOrigins = [
        "http://localhost:8081", // Expo mobile
        "http://localhost:5173", // Vite web dev
        process.env.FRONTEND_URL, // production
    ].filter(Boolean) as string[];

    const io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } });

    // verify socket connection - if the user is authenticated, we will store the user id in the socket
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token; // this is what user will send from client
        if (!token) return next(new Error("Authentication error"));

        try {
            const session = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });

            const clerkId = session.sub;

            const user = await User.findOne({ clerkId });
            if (!user) return next(new Error("User not found"));

            socket.data.userId = user._id.toString();

            next();
        } catch (error: any) {
            if (error instanceof Error) {
                next(error);
            } else {
                const message = error?.message ?? (typeof error === "string" ? error : JSON.stringify(error));
                next(new Error(message));
            }
        }
    });

    // this "connection" event name is special and should be written like this
    // it's the event that is triggered when a new client connects to the server
    io.on("connection", (socket) => {
        const userId = socket.data.userId;

        // send list of currently online users to the newly connected client
        socket.emit("online-users", { userIds: Array.from(onlineUsers.keys()) });

        // Add this socket to the user's Set. Only emit "user-online" on the
        // very first connection so other clients don't receive spurious events
        // when the same user opens a second tab/device.
        const isFirstConnection = !onlineUsers.has(userId);
        if (isFirstConnection) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId)!.add(socket.id);
        socketUserMap.set(socket.id, userId);

        if (isFirstConnection) {
            socket.broadcast.emit("user-online", { userId });
        }

        socket.join(`user:${userId}`);

        // join-chat: verify the authenticated user is actually a participant
        // before allowing the socket into the room.
        socket.on("join-chat", async (chatId: string) => {
            try {
                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId,
                });

                if (!chat) {
                    socket.emit("socket-error", { message: "Not authorized to join this chat" });
                    return;
                }

                socket.join(`chat:${chatId}`);
            } catch {
                socket.emit("socket-error", { message: "Failed to join chat" });
            }
        });

        socket.on("leave-chat", (chatId: string) => {
            socket.leave(`chat:${chatId}`);
        });

        // handle sending messages
        socket.on("send-message", async (data: { chatId: string; text: string }) => {
            try {
                const { chatId } = data;
                const text = data.text?.trim();

                if (!text || text.length === 0) {
                    socket.emit("socket-error", { message: "Invalid message" });
                    return;
                }

                if (text.length > 2000) {
                    socket.emit("socket-error", { message: "Invalid message" });
                    return;
                }

                const chat = await Chat.findOne({
                    _id: chatId,
                    participants: userId,
                });

                if (!chat) {
                    socket.emit("socket-error", { message: "Chat not found" });
                    return;
                }

                const message = await Message.create({
                    chat: chatId,
                    sender: userId,
                    text,
                });

                chat.lastMessage = message._id;
                chat.lastMessageAt = new Date();
                await chat.save();

                await message.populate("sender", "name avatar");

                // emit to chat room (for users inside the chat)
                io.to(`chat:${chatId}`).emit("new-message", message);

                // emit to each participant's personal room only if NONE of their
                // sockets are already in the chat room (avoids duplicate delivery
                // across multi-device connections).
                const chatRoomSockets = io.sockets.adapter.rooms.get(`chat:${chatId}`) ?? new Set<string>();
                for (const participantId of chat.participants) {
                    const participantSockets = onlineUsers.get(participantId.toString());
                    if (!participantSockets) continue;

                    // Skip if any of the participant's sockets are in the chat room
                    const alreadyInRoom = [...participantSockets].some((sid) => chatRoomSockets.has(sid));
                    if (alreadyInRoom) continue;

                    io.to(`user:${participantId}`).emit("new-message", message);
                }
            } catch (error) {
                socket.emit("socket-error", { message: "Failed to send message" });
            }
        });

        // typing handler: always uses DB lookup so only real participants receive events.
        socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
            const typingPayload = {
                userId,
                chatId: data.chatId,
                isTyping: data.isTyping,
            };

            // emit to chat room (for users inside the chat)
            socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

            // emit to participant personal rooms via DB-verified participant list
            try {
                const chat = await Chat.findOne({ _id: data.chatId, participants: userId });
                if (chat) {
                    for (const participantId of chat.participants) {
                        if (participantId.toString() === userId) continue;
                        socket.to(`user:${participantId}`).emit("typing", typingPayload);
                    }
                }
            } catch {
                // silently fail - typing indicator is not critical
            }
        });

        socket.on("disconnect", () => {
            // Use the reverse map for reliable userId resolution
            const resolvedUserId = socketUserMap.get(socket.id) ?? userId;
            socketUserMap.delete(socket.id);

            const userSockets = onlineUsers.get(resolvedUserId);
            if (!userSockets) return; // guard against rapid/duplicate disconnect events

            userSockets.delete(socket.id);

            // Only emit user-offline and clean up when ALL sockets for this user
            // are gone, preventing premature offline signals on multi-device use.
            if (userSockets.size === 0) {
                onlineUsers.delete(resolvedUserId);
                socket.broadcast.emit("user-offline", { userId: resolvedUserId });
            }
        });
    });

    return io;
};