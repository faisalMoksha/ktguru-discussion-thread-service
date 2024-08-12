import answerModel from "../models/answerModel";
import { RequestAnswer } from "../types";

export class AnswerService {
    async create({
        answer,
        projectId,
        questionId,
        userId,
        file,
    }: RequestAnswer) {
        return await answerModel.create({
            answer,
            questionId: questionId,
            userId: userId,
            projectId: projectId,
            isActive: true,
            ...(file && { file: file }),
        });
    }

    async addComment(comment: string, answerId: string, userId: string) {
        return await answerModel.findByIdAndUpdate(
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
        );
    }

    async getAnswerForActivity(
        projectId: string,
        result: number,
        limit: number,
    ) {
        //TODO:1. populate user data
        return await answerModel
            .find({
                projectId: projectId,
            })
            .sort({ createdAt: -1 })
            .skip(result)
            .limit(limit)
            .populate("questionId", "title") // Populate question information for each answer
            // .populate("userId", "lastName firstName avatar")
            .populate("comments.answerId", "answerData questionId"); // Populate answer information for each comment
        // .populate("comments.userId", "lastName firstName avatar");
    }

    async get(questionId: string) {
        //TODO:1. populate user data
        return await answerModel.find({ questionId: questionId });
        // .populate("userId", "lastName firstName avatar")
        // .populate("comments.userId", "lastName firstName avatar");
    }
}
