import crypto from "crypto";
import tokenModel from "../models/tokenModel";
import { GenerateTokenPayload } from "../types";

export class TokenService {
    async create({
        userId,
        questionId,
        answerId,
        projectId,
    }: GenerateTokenPayload) {
        return await tokenModel.create({
            userId: userId,
            questionId: questionId,
            token: crypto.randomBytes(32).toString("hex"),
            answerId: answerId,
            projectId,
        });
    }

    async get(token: string) {
        return await tokenModel.findOne({ token: token });
    }
}
