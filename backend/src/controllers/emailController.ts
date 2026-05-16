import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";

// Helper to parse email headers
const getHeader = (headers: any[], name: string) => {
    const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : "";
};

export async function getEmailThreads(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No Google Access Token provided in Authorization header" });
        }

        const accessToken = authHeader.split(" ")[1];

        // 1. Fetch threads from Gmail (excluding promotions and social)
        const threadsRes = await fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/threads?maxResults=15&q=-category:promotions -category:social",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!threadsRes.ok) {
            const errorText = await threadsRes.text();
            console.error("Gmail API Error:", errorText);
            return res.status(threadsRes.status).json({ message: "Failed to fetch from Gmail API" });
        }

        const threadsData = await threadsRes.json();
        const threads = threadsData.threads || [];

        // 2. Fetch full details for each thread to get the sender, subject, and snippet
        const formattedChats = await Promise.all(
            threads.map(async (thread: any) => {
                const detailRes = await fetch(
                    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${thread.id}`,
                    {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }
                );
                
                if (!detailRes.ok) return null;
                const detailData = await detailRes.json();

                // Get the latest message in the thread
                const messages = detailData.messages || [];
                const latestMessage = messages[messages.length - 1];
                const headers = latestMessage.payload.headers;

                const fromHeader = getHeader(headers, "From");
                const subject = getHeader(headers, "Subject") || "No Subject";
                const dateStr = getHeader(headers, "Date");
                
                // Parse "John Doe <john@example.com>" -> Name: "John Doe", Email: "john@example.com"
                let senderName = fromHeader;
                const nameMatch = fromHeader.match(/^(.*?)\s*<.*>$/);
                if (nameMatch) {
                    senderName = nameMatch[1].replace(/"/g, "").trim();
                }

                return {
                    _id: thread.id,
                    isGroup: false,
                    participant: {
                        _id: fromHeader, // Using raw header as unique ID
                        name: senderName,
                        email: fromHeader,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`,
                    },
                    lastMessage: {
                        _id: latestMessage.id,
                        text: `**${subject}**\n${detailData.snippet}`, // Combine subject and snippet
                        sender: fromHeader,
                        createdAt: new Date(dateStr).toISOString(),
                    },
                    lastMessageAt: new Date(dateStr).toISOString(),
                    createdAt: new Date(dateStr).toISOString(),
                    mode: "professional", // Enforce professional mode
                };
            })
        );

        // Filter out nulls and sort by date descending
        const validChats = formattedChats
            .filter((c) => c !== null)
            .sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

        res.json(validChats);
    } catch (error) {
        console.error("Error fetching emails:", error);
        res.status(500);
        next(error);
    }
}
