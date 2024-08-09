import mongoose from "mongoose";
import { Answer } from "../types";

const answerSchema = new mongoose.Schema<Answer>(
    {
        answer: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        file: {
            type: String,
        },
        comments: [
            {
                comment: {
                    type: String,
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                answerId: {
                    type: mongoose.Schema.Types.ObjectId,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true },
);

export default mongoose.model<Answer>("Answer", answerSchema);
