import { Request } from "express";
import mongoose from "mongoose";

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
    };
}

export interface Question {
    title: string;
    description: string;
    file: string;
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    model_type: string;
    summary: {
        para: string;
        file: string;
    };
    isClosed: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comments {
    comment: string;
    userId: mongoose.Types.ObjectId;
    answerId: mongoose.Types.ObjectId;
    createdAt: Date;
}

export interface Answer {
    answer: string;
    file: string;
    questionId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    model_type: string;
    comments: Comments[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface RequestAnswer {
    answer: string;
    projectId: string;
    questionId: string;
    userId: string;
    file?: string | null;
}

export interface RequestQuestion {
    title: string;
    description: string;
    projectId: string;
    userId: string;
    model_type: string;
    file?: string | null;
}

export interface FileData {
    filename: string;
    fileData: ArrayBuffer;
}

export interface FileStorage {
    upload(data: FileData): Promise<void>;
    delete(filename: string): void;
    getObjectUri(filename: string): string;
}

export interface UserCache {
    userId: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
}

export interface MessagePayload {
    event_type: string;
    data: UserCache;
}

export interface TokenTypes {
    userId: string;
    token: string;
    questionId: string;
    answerId: string;
    projectId: string;
    createdAt: Date;
}

export interface GenerateTokenPayload {
    userId: string;
    questionId?: string;
    answerId?: string;
    projectId?: string;
}

export interface Resources {
    userId: mongoose.Types.ObjectId;
    userRole: string;
    isApproved: boolean;
    status: string;
    createdAt: Date;
}
