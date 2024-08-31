import answerModel from "../models/answerModel";
import userCacheModel from "../models/userCacheModel";
import logger from "../config/logger";
import { RequestAnswer } from "../types";

export class AnswerService {
    async create({
        answer,
        projectId,
        questionId,
        userId,
        file,
    }: RequestAnswer) {
        let data = await answerModel.create({
            answer,
            questionId: questionId,
            userId: userId,
            projectId: projectId,
            isActive: true,
            ...(file && { file: file }),
        });

        data = await data.populate({
            path: "userId",
            model: "UserCache",
            select: "firstName lastName avatar",
            foreignField: "userId",
        });

        return data;
    }

    async addComment(comment: string, answerId: string, userId: string) {
        return await answerModel
            .findByIdAndUpdate(
                { _id: answerId },
                {
                    $push: {
                        comments: {
                            comment: comment,
                            userId: userId,
                            answerId: answerId,
                        },
                    },
                },
                { new: true },
            )
            .populate({
                path: "comments.userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            });
    }

    async getAnswerForActivity(
        projectId: string,
        result: number,
        limit: number,
    ) {
        return await answerModel
            .find({
                projectId: projectId,
            })
            .sort({ createdAt: -1 })
            .skip(result)
            .limit(limit)
            .populate("questionId", "title") // Populate question information for each answer
            .populate({
                path: "userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            })
            .populate("comments.answerId", "answerData questionId") // Populate answer information for each comment
            .populate({
                path: "comments.userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            });
    }

    async get(questionId: string) {
        return await answerModel
            .find({ questionId: questionId })
            .populate({
                path: "userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            })
            .populate({
                path: "comments.userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            });
    }

    async getUserInfo(userId: string) {
        return await userCacheModel.findOne({ userId: userId });
    }

    async savedReply({
        type,
        answerId,
        questionId,
        reply,
        fileName,
        userId,
        projectId,
    }: any) {
        switch (type) {
            case "answer":
                return await answerModel.create({
                    answer: reply,
                    questionId: questionId,
                    userId: userId,
                    projectId: projectId,
                    isActive: true,
                    ...(fileName && { file: fileName }),
                });
            case "comment":
                return await answerModel.findByIdAndUpdate(
                    { _id: answerId },
                    {
                        $push: {
                            comments: {
                                comment: reply,
                                userId: userId,
                                answerId: answerId,
                            },
                        },
                    },
                );

            default:
                logger.info("Doing nothing...");
        }
    }
}
