import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Types } from "mongoose";

export async function getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId
        const chats = await Chat.find({ participants: userId })
            .populate("participants", "name email avatar")
            .populate("lastMessage")
            .sort({ lastMessageAt: -1 })

        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants
                .find(p => p._id.toString() !== userId);

            return {
                _id: chat._id,
                participant: otherParticipant ?? null,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
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

        if (!participantId) {
            return res.status(400).json({ message: "Participant ID is required" });
        }

        if (participantId === userId) {
            return res.status(400).json({ message: "You cannot create a chat with yourself" });
        }

        if (!Types.ObjectId.isValid(participantId as string)) {
            return res.status(400).json({ message: "Invalid Participant ID" });
        }

        // Atomic upsert — avoids TOCTOU race between find and insert
        const participants = [userId, participantId].sort(); // normalize order for unique index
        const chat = await Chat.findOneAndUpdate(
            { participants: { $all: participants } },
            { $setOnInsert: { participants } },
            { new: true, upsert: true }
        )
            .populate("participants", "name email avatar")
            .populate("lastMessage");

        const otherParticipant = chat.participants.find((p) =>
            p._id.toString() !== userId);

        res.json({
            _id: chat._id,
            participant: otherParticipant ?? null,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            createdAt: chat.createdAt,
        })

    }
    catch (error) {
        res.status(500);
        next(error);
    }

}