import mongoose from "mongoose";
import { Answer } from "../types";
import { Config } from "../config";

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
        model_type: {
            type: String,
            enum: ["Project", "Subsection"],
            default: "Project",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        file: {
            type: String,
            get: (file: string) => {
                if (file) {
                    return `https://${Config.S3_BUCKET}.s3.${Config.S3_REGION}.amazonaws.com/${file}`;
                }
            },
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
    { timestamps: true, toJSON: { getters: true } },
);

export default mongoose.model<Answer>("Answer", answerSchema);
