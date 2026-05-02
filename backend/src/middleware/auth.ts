import type { Request, Response, NextFunction } from "express";
import { getAuth, requireAuth } from "@clerk/express";
import { User } from "../models/User";

export type AuthRequest = Request & { userId?: string }

export const protectRoute = [
    requireAuth(),
    async (req: AuthRequest, res: Response, next: NextFunction) => {

        try {
            const { userId: clerkId } = getAuth(req)
            if (!clerkId) return res.status(401).json({ error: "Unauthorized" })

            const user = await User.findOne({ clerkId })
            if (!user) return res.status(404).json({ error: "User not found" });

            req.userId = user._id.toString();

            return next()

        } catch (error) {
            console.error("Auth middleware error:", error)
            res.status(500);
            next(error);

        }
    }
]
