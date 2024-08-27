import mongoose from "mongoose";
import { TokenTypes } from "../types";

const tokenSchema = new mongoose.Schema<TokenTypes>(
    {
        userId: {
            type: String,
        },
        token: {
            type: String,
        },
        questionId: {
            type: String,
        },
        answerId: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true },
);

export default mongoose.model<TokenTypes>("TokenSchema", tokenSchema);
