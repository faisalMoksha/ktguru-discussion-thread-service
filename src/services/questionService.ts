import questionModel from "../models/questionModel";
import { RequestQuestion } from "../types";

export class QuestionService {
    async create({
        title,
        description,
        projectId,
        userId,
        file,
    }: RequestQuestion) {
        return await questionModel.create({
            title,
            description,
            projectId,
            userId,
            file,
            isActive: true,
        });
    }

    async getById(id: string) {
        return await questionModel.findById(id);
    }

    async getAll(projectId: string, isClosed: boolean, skipCount: number) {
        const limit = 10;
        const skip = skipCount;
        const result = limit * skip;

        return await questionModel
            .find({ projectId, isClosed })
            .sort({ createdAt: -1 })
            .skip(result)
            .limit(limit);
    }

    async close(id: string, para: string) {
        return await questionModel.findByIdAndUpdate(
            { _id: id },
            {
                summary: {
                    para,
                },
                isClosed: true,
            },
            { new: true },
        );
    }

    async search(searchTerm: string, projectId: string) {
        //TODO: 1. populate user data

        return await questionModel.find({
            projectId: projectId,
            title: { $regex: searchTerm, $options: "i" },
        });
    }

    async getQuestionsForActivity(
        projectId: string,
        result: number,
        limit: number,
    ) {
        //TODO:1. populate user data
        return await questionModel
            .find({
                projectId: projectId,
            })
            .sort({ createdAt: -1 })
            .skip(result)
            .limit(limit);
    }
}
