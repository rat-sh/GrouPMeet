import mongoose, { Schema, type Document } from "mongoose";

export interface IChat extends Document {
    // common
    participants: mongoose.Types.ObjectId[];
    lastMessage: mongoose.Types.ObjectId | null;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;

    // group-specific (undefined/null for DMs)
    isGroup: boolean;
    name?: string;
    avatar?: string;
    admins?: mongoose.Types.ObjectId[];
}

const ChatSchema = new Schema<IChat>(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },

        // --- group fields ---
        isGroup: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    { timestamps: true }
);

// Unique index only for DM chats (isGroup: false) so two users can't have
// duplicate DMs, but any number of group chats can share the same participants.
ChatSchema.index(
    { participants: 1 },
    {
        unique: true,
        partialFilterExpression: { isGroup: false },
    }
);

// Normalize participant order for DMs so [A,B] and [B,A] map to the same index entry.
ChatSchema.pre("save", async function () {
    if (!this.isGroup && this.isModified("participants")) {
        this.participants.sort((a, b) => a.toString().localeCompare(b.toString()));
    }
});

export const Chat = mongoose.model("Chat", ChatSchema);