import mongoose from "mongoose";
import { Question } from "../types";
import { Config } from "../config";

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
            get: (file: string) => {
                if (file) {
                    return `https://${Config.S3_BUCKET}.s3.${Config.S3_REGION}.amazonaws.com/${file}`;
                }
            },
        },
        summary: {
            para: String,
            file: {
                type: String,
                get: (file: string) => {
                    if (file) {
                        return `https://${Config.S3_BUCKET}.s3.${Config.S3_REGION}.amazonaws.com/${file}`;
                    }
                },
            },
        },
    },
    { timestamps: true, toJSON: { getters: true } },
);

export default mongoose.model<Question>("Question", questionSchema);
