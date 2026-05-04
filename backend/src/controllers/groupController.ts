import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Types } from "mongoose";

// ─── Create Group ────────────────────────────────────────────────────────────
// POST /api/groups
// Body: { name: string, memberIds: string[], avatar?: string }
export async function createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const { name, memberIds, avatar } = req.body as {
            name: string;
            memberIds: string[];
            avatar?: string;
        };

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ message: "Group name is required" });
        }

        if (!Array.isArray(memberIds) || memberIds.length < 1) {
            return res.status(400).json({ message: "At least one other member is required" });
        }

        for (const id of memberIds) {
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: `Invalid member ID: ${id}` });
            }
        }

        // Deduplicate and always include creator
        const participantSet = new Set<string>([userId, ...memberIds]);
        const participants = Array.from(participantSet);

        // Use `new Chat().save()` to avoid Mongoose overload resolution issues
        // with `Chat.create()` when extra fields like `isGroup` are present.
        const group = new Chat({
            isGroup: true,
            name: name.trim(),
            avatar: avatar ?? null,
            participants,
            admins: [userId],
        });
        await group.save();

        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.status(201).json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Get Group Info ───────────────────────────────────────────────────────────
// GET /api/groups/:groupId
export async function getGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true, participants: userId })
            .populate("participants", "name avatar")
            .populate("admins", "name avatar")
            .populate("lastMessage");

        if (!group) {
            return res.status(404).json({ message: "Group not found or you are not a member" });
        }

        res.json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Update Group ─────────────────────────────────────────────────────────────
// PATCH /api/groups/:groupId
// Body: { name?: string, avatar?: string }
export async function updateGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;
        const { name, avatar } = req.body as { name?: string; avatar?: string };

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admins can update group info" });
        }

        if (name !== undefined) group.name = name.trim() || group.name;
        if (avatar !== undefined) group.avatar = avatar;

        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Add Members ─────────────────────────────────────────────────────────────
// POST /api/groups/:groupId/members
// Body: { memberIds: string[] }
export async function addMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;
        const { memberIds } = req.body as { memberIds: string[] };

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        if (!Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "At least one member ID is required" });
        }

        for (const id of memberIds) {
            if (!Types.ObjectId.isValid(id)) {
                return res.status(400).json({ message: `Invalid member ID: ${id}` });
            }
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        const currentIds = group.participants.map((p) => p.toString());
        const newIds = memberIds.filter((id) => !currentIds.includes(id));
        if (newIds.length === 0) {
            return res.status(400).json({ message: "All provided users are already members" });
        }

        group.participants.push(...newIds.map((id) => new Types.ObjectId(id)));
        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Remove Member ────────────────────────────────────────────────────────────
// DELETE /api/groups/:groupId/members/:memberId
export async function removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;
        const memberId = req.params.memberId as string;

        if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        // Admins can remove anyone; a member can only remove themselves (leave)
        if (!isAdmin && memberId !== userId) {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        group.participants = group.participants.filter((p) => p.toString() !== memberId) as typeof group.participants;
        group.admins = group.admins?.filter((a) => a.toString() !== memberId) as typeof group.admins;

        // If no admins left, promote the oldest remaining member
        if (group.admins && group.admins.length === 0 && group.participants.length > 0) {
            group.admins = [group.participants[0]] as typeof group.admins;
        }

        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Promote to Admin ─────────────────────────────────────────────────────────
// POST /api/groups/:groupId/admins/:memberId
export async function promoteToAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;
        const memberId = req.params.memberId as string;

        if (!Types.ObjectId.isValid(groupId) || !Types.ObjectId.isValid(memberId)) {
            return res.status(400).json({ message: "Invalid ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) return res.status(403).json({ message: "Only admins can promote members" });

        const isMember = group.participants.some((p) => p.toString() === memberId);
        if (!isMember) return res.status(400).json({ message: "User is not a group member" });

        const alreadyAdmin = group.admins?.some((a) => a.toString() === memberId);
        if (alreadyAdmin) return res.status(400).json({ message: "User is already an admin" });

        // Ensure admins array exists before pushing
        if (!group.admins) group.admins = [];
        group.admins.push(new Types.ObjectId(memberId));

        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Leave Group ─────────────────────────────────────────────────────────────
// POST /api/groups/:groupId/leave
export async function leaveGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true, participants: userId });
        if (!group) return res.status(404).json({ message: "Group not found or you are not a member" });

        group.participants = group.participants.filter((p) => p.toString() !== userId) as typeof group.participants;
        group.admins = group.admins?.filter((a) => a.toString() !== userId) as typeof group.admins;

        // Auto-promote if no admins remain
        if (group.admins && group.admins.length === 0 && group.participants.length > 0) {
            group.admins = [group.participants[0]] as typeof group.admins;
        }

        // Delete empty group
        if (group.participants.length === 0) {
            await group.deleteOne();
            return res.json({ message: "Group deleted (no members left)" });
        }

        await group.save();
        res.json({ message: "Left the group" });
    } catch (error) {
        res.status(500);
        next(error);
    }
}

// ─── Delete Group ─────────────────────────────────────────────────────────────
// DELETE /api/groups/:groupId
export async function deleteGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId!;
        const groupId = req.params.groupId as string;

        if (!Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: "Invalid group ID" });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) return res.status(403).json({ message: "Only admins can delete the group" });

        await group.deleteOne();
        res.json({ message: "Group deleted" });
    } catch (error) {
        res.status(500);
        next(error);
    }
}
