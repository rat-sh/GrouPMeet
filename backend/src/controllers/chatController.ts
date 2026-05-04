import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";

export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const chats = await Chat.find({ participants: userId })
            .populate("participants", "name email avatar")
            .populate("lastMessage")
            .sort({ lastMessage: -1 })

        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants
                .find(p => p._id.toString() !== userId);
            return {
                _id: chat._id,
                participant: otherParticipant,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessage,
                createdAt: chat.createdAt,
            };
        });

        res.json(formattedChats)

    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function getOrCreateChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const { participantId } = req.params;

        // checking, chats which already exist between those two participants
        let chat = await Chat.findOne({
            participants: { $all: [userId, participantId] },
        })
            .populate("participants", "name email avatar")
            .populate("lastMessage");

        if (!chat) {
            const newChat = new Chat({
                participants: [userId, participantId]
            });
            await newChat.save();
            chat = await newChat.populate("participants", "name email avatar");
        }

        const otherParticipant = chat.participants.find((p) =>
            p._id.toString() !== userId);

        res.json({
            _id: chat._id,
            participant: otherParticipant ?? null,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessage,
            createdAt: chat.createdAt,
        })

    }
    catch (error) {
        res.status(500);
        next(error);
    }

}