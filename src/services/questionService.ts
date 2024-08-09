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

    async getAll(projectId: string, isClosed: boolean) {
        //TODO: 1. implement pagination

        return await questionModel
            .find({ projectId, isClosed })
            .sort({ createdAt: -1 });
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

    async search(searchTerm: string, id: string) {
        //TODO: 1. populate user data

        return await questionModel.find({
            _id: id,
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
