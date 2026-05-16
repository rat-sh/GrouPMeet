import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        // CRITICAL PRIVACY: Never select or return phoneNumber to other users!
        const users = await User.find({ _id: { $ne: userId } }).select("displayName username email avatar").limit(30);
        res.json(users)
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const user = await User.findById(req.userId).select("-clerkId");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function savePhoneNumber(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            res.status(400).json({ message: "Phone number is required" });
            return;
        }

        // Check if phone number is already claimed
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser && existingUser._id.toString() !== req.userId) {
            res.status(409).json({ message: "Phone number is already in use by another account" });
            return;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { phoneNumber },
            { new: true }
        ).select("-clerkId");

        res.json(user);
    } catch (error) {
        res.status(500);
        next(error);
    }
}

export async function syncContacts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const { phoneNumbers } = req.body;
        
        if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
            res.status(400).json({ message: "An array of phone numbers is required" });
            return;
        }

        const userId = req.userId;

        // Clean up formatting to match our DB storage (assuming basic string matching for now)
        // In a production app, you'd use a library like google-libphonenumber
        const normalizedNumbers = phoneNumbers.map(n => n.replace(/[^0-9+]/g, ""));

        // Find users matching these numbers, excluding self, who allow discovery
        const discoveredUsers = await User.find({
            _id: { $ne: userId },
            phoneNumber: { $in: normalizedNumbers },
            allowPhoneDiscovery: true
        }).select("displayName username email avatar"); // CRITICAL: NEVER return phoneNumber!

        res.json(discoveredUsers);
    } catch (error) {
        res.status(500);
        next(error);
    }
}