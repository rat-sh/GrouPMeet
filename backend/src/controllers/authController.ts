import { User } from "../models/User";
import type { AuthRequest } from "../middleware/auth";
import type { Response, Request, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";

/**
 * Fetches the currently authenticated user and sends it in the HTTP response.
 *
 * Attempts to load the user identified by `req.userId`. If the user is not found,
 * responds with 404 and `{ error: "User not found" }`. On unexpected errors,
 * sets the response status to 500 and forwards the error to `next`.
 *
 * @param req - Express request expected to contain the authenticated user's id at `req.userId`
 */
export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}

/**
 * Ensure a local User record exists for the authenticated Clerk user and respond with that user.
 *
 * Extracts the Clerk `userId` from the request authentication. If `userId` is absent, responds with 401 Unauthorized. Finds a local User by `clerkId`; if none exists, fetches the Clerk user and creates a local User (setting `clerkId`, `name`, `email`, and `avatar`) before responding. On error, sets the response status to 500 and forwards the error to `next`.
 */
export async function authCallback(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId: clerkId } = getAuth(req) as { userId: string }

        //create user
        if (!clerkId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        let user = await User.findOne({ clerkId });
        if (!user) {
            const clerkUser = await clerkClient.users.getUser(clerkId)

            user = await User.create({
                clerkId,
                name: clerkUser.firstName
                    ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
                    : clerkUser.emailAddresses[0]?.emailAddress.split("@")[0],
                email: clerkUser.emailAddresses[0]?.emailAddress,
                avatar: clerkUser.imageUrl
            });
        }
        res.json(user)

    }
    catch (error) {
        res.status(500);
        next(error);
    }
}