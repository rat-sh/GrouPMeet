import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";
import type { Response, Request, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

export async function authCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const auth = getAuth(req);
        const clerkId = auth?.userId ?? null;

        if (!clerkId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const clerkUser = await clerkClient.users.getUser(clerkId);

        const email = clerkUser.emailAddresses[0]?.emailAddress;
        const displayName = clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : email?.split("@")[0] || "User";

        if (!email) {
            res.status(422).json({ error: "Clerk user has no email" });
            return;
        }

        // Generate a random 4-digit suffix for the username
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
        const username = `@${baseUsername}_${randomSuffix}`;

        const user = await User.findOneAndUpdate(
            { clerkId },
            { $setOnInsert: { clerkId, displayName, username, email, avatar: clerkUser.imageUrl } },
            { upsert: true, new: true }
        );

        res.json(user);
    } catch (error) {
        res.status(500);
        next(error);
    }
}