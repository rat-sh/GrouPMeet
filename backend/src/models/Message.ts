import mongoose, { Schema, type Document } from "mongoose";

export interface IMessage extends Document {
    chat: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    text: string;
    attachments?: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        attachments: [
            {
                type: String,

            }
        ]
    },
    { timestamps: true }
);

MessageSchema.index({ chat: 1, createdAt: 1 }); // oldest one message
// 1 = asc
// -1 = dsc

export const Message = mongoose.model("Message", MessageSchema);