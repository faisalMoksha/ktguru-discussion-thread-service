import questionModel from "../models/questionModel";
import { RequestQuestion } from "../types";

export class QuestionService {
    async create({
        title,
        description,
        projectId,
        model_type,
        userId,
        file,
    }: RequestQuestion) {
        let data = await questionModel.create({
            title,
            description,
            projectId,
            model_type,
            userId,
            ...(file && { file: file }),
            isActive: true,
        });

        data = await data.populate({
            path: "userId",
            model: "UserCache",
            select: "firstName lastName avatar",
            foreignField: "userId",
        });

        return data;
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

    async close(id: string, para: string, fileName: string | null) {
        return await questionModel.findByIdAndUpdate(
            { _id: id },
            {
                summary: {
                    para,
                    ...(fileName && { file: fileName }),
                },
                isClosed: true,
            },
            { new: true },
        );
    }

    async search(searchTerm: string, projectId: string) {
        return await questionModel
            .find({
                projectId: projectId,
                title: { $regex: searchTerm, $options: "i" },
            })
            .populate({
                path: "userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            });
    }

    async getQuestionsForActivity(
        projectId: string,
        result: number,
        limit: number,
    ) {
        return await questionModel
            .find({
                projectId: projectId,
            })
            .sort({ createdAt: -1 })
            .skip(result)
            .limit(limit)
            .populate({
                path: "userId",
                model: "UserCache",
                select: "firstName lastName avatar",
                foreignField: "userId",
            });
    }
}
