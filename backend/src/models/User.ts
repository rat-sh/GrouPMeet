import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
    clerkId: string;
    username: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    allowPhoneDiscovery: boolean;
    avatar: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        clerkId: {
            type: String,
            unique: true,
            required: true
        },
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        phoneNumber: {
            type: String,
            unique: true,
            sparse: true, // Allows multiple users to have 'null' while they are onboarding
            trim: true
        },
        allowPhoneDiscovery: {
            type: Boolean,
            default: true
        },
        avatar: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
)

export const User = mongoose.model("User", UserSchema)