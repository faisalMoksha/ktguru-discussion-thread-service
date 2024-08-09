import mongoose from "mongoose";
import { Question } from "../types";

const questionSchema = new mongoose.Schema<Question>(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        isClosed: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        file: {
            type: String,
        },
        summary: {
            para: String,
            file: String,
        },
    },
    { timestamps: true },
);

export default mongoose.model<Question>("Question", questionSchema);
