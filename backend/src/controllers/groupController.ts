import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middleware/auth";
import { Chat } from "../models/Chat";
import { Message } from "../models/Message";
import { User } from "../models/User";
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

        // Validate ObjectId format
        const invalidFormat = memberIds.filter((id) => !Types.ObjectId.isValid(id));
        if (invalidFormat.length > 0) {
            return res.status(400).json({ message: `Invalid member IDs: ${invalidFormat.join(", ")}` });
        }

        // Verify all memberIds actually exist in the User collection
        const existingUsers = await User.find({ _id: { $in: memberIds } }, "_id");
        const existingIds = new Set(existingUsers.map((u) => u._id.toString()));
        const nonExistent = memberIds.filter((id) => !existingIds.has(id));
        if (nonExistent.length > 0) {
            return res.status(400).json({ message: `Users not found: ${nonExistent.join(", ")}` });
        }

        // Deduplicate and always include creator
        const participantSet = new Set<string>([userId, ...memberIds]);
        const participants = Array.from(participantSet);

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

        // participants: userId ensures non-members can't even reach the admin check
        const group = await Chat.findOne({ _id: groupId, isGroup: true, participants: userId });
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

        const invalidFormat = memberIds.filter((id) => !Types.ObjectId.isValid(id));
        if (invalidFormat.length > 0) {
            return res.status(400).json({ message: `Invalid member IDs: ${invalidFormat.join(", ")}` });
        }

        const group = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        // O(1) membership check with a Set
        const currentIds = new Set(group.participants.map((p) => p.toString()));
        const newIds = memberIds.filter((id) => !currentIds.has(id));
        if (newIds.length === 0) {
            return res.status(400).json({ message: "All provided users are already members" });
        }

        // Verify new members exist in the User collection
        const existingUsers = await User.find({ _id: { $in: newIds } }, "_id");
        const existingIds = new Set(existingUsers.map((u) => u._id.toString()));
        const nonExistent = newIds.filter((id) => !existingIds.has(id));
        if (nonExistent.length > 0) {
            return res.status(400).json({ message: `Users not found: ${nonExistent.join(", ")}` });
        }

        group.participants.push(...newIds.map((id) => new Types.ObjectId(id)));
        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
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

        // Fetch first for the authorization check
        const groupForAuth = await Chat.findOne({ _id: groupId, isGroup: true });
        if (!groupForAuth) return res.status(404).json({ message: "Group not found" });

        const isAdmin = groupForAuth.admins?.some((id) => id.toString() === userId);
        // Admins can remove anyone; a member can only remove themselves
        if (!isAdmin && memberId !== userId) {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        // Atomic $pull from both arrays in one operation
        const updated = await Chat.findOneAndUpdate(
            { _id: groupId, isGroup: true, participants: new Types.ObjectId(memberId) },
            { $pull: { participants: new Types.ObjectId(memberId), admins: new Types.ObjectId(memberId) } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Member not found in group" });

        // If no admins remain, promote the first remaining participant
        if (updated.admins && updated.admins.length === 0 && updated.participants.length > 0) {
            await Chat.updateOne({ _id: groupId }, { $addToSet: { admins: updated.participants[0] } });
            updated.admins = [updated.participants[0]] as typeof updated.admins;
        }

        await updated.populate("participants", "name avatar");
        await updated.populate("admins", "name avatar");

        res.json(updated);
    } catch (error) {
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

        // participants: userId ensures non-members can't reach the admin check
        const group = await Chat.findOne({ _id: groupId, isGroup: true, participants: userId });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) return res.status(403).json({ message: "Only admins can promote members" });

        const isMember = group.participants.some((p) => p.toString() === memberId);
        if (!isMember) return res.status(400).json({ message: "User is not a group member" });

        const alreadyAdmin = group.admins?.some((a) => a.toString() === memberId);
        if (alreadyAdmin) return res.status(400).json({ message: "User is already an admin" });

        if (!group.admins) group.admins = [];
        group.admins.push(new Types.ObjectId(memberId));

        await group.save();
        await group.populate("participants", "name avatar");
        await group.populate("admins", "name avatar");

        res.json(group);
    } catch (error) {
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

        // Atomic $pull — same race-safe pattern as removeMember
        const updated = await Chat.findOneAndUpdate(
            { _id: groupId, isGroup: true, participants: new Types.ObjectId(userId) },
            { $pull: { participants: new Types.ObjectId(userId), admins: new Types.ObjectId(userId) } },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Group not found or you are not a member" });

        // Auto-promote if no admins remain
        if (updated.admins && updated.admins.length === 0 && updated.participants.length > 0) {
            await Chat.updateOne({ _id: groupId }, { $addToSet: { admins: updated.participants[0] } });
        }

        // Delete empty group and cascade messages
        if (updated.participants.length === 0) {
            await Message.deleteMany({ chat: updated._id });
            await updated.deleteOne();
            return res.json({ message: "Group deleted (no members left)" });
        }

        res.json({ message: "Left the group" });
    } catch (error) {
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

        // participants: userId ensures non-members can't reach the admin check
        const group = await Chat.findOne({ _id: groupId, isGroup: true, participants: userId });
        if (!group) return res.status(404).json({ message: "Group not found" });

        const isAdmin = group.admins?.some((id) => id.toString() === userId);
        if (!isAdmin) return res.status(403).json({ message: "Only admins can delete the group" });

        // Cascade-delete all messages before removing the group
        await Message.deleteMany({ chat: group._id });
        await group.deleteOne();

        res.json({ message: "Group deleted" });
    } catch (error) {
        next(error);
    }
}
