import { Request, Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import createHttpError from "http-errors";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import { validationResult } from "express-validator";

export class QuestionClass {
    constructor(
        private questionService: QuestionService,
        private answerService: AnswerService,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        //TODO:1. Implement file upload functionality
        //TODO:2. Implement firebase notification functionality
        //TODO:3  Implement send mail functionality to mentionUsers
        //TODO:4  Populate users data

        const { title, description, projectId } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            if (!req.auth || !req.auth.sub) {
                return next(
                    createHttpError(
                        400,
                        "Unauthorized access to ask questions",
                    ),
                );
            }

            const userId = req.auth.sub;

            const data = await this.questionService.create({
                title,
                description,
                projectId,
                userId,
            });

            res.status(201).json({ data, message: "", success: true });
        } catch (error) {
            return next(error);
        }
    };

    get = async (req: Request, res: Response) => {
        const id = req.params.id;

        const question = await this.questionService.getById(id);

        const answer = await this.answerService.get(id);

        res.status(200).json({
            data: { question: question, answer: answer },
            message: "",
            success: true,
        });
    };

    getAll = async (req: Request, res: Response) => {
        const { projectId, isClosed } = req.body;

        const data = await this.questionService.getAll(projectId, isClosed);

        res.status(200).json({ data, message: "", success: true });
    };

    close = async (req: Request, res: Response) => {
        //TODO: 1. implement file upload functionality

        const { para, id } = req.body;

        const question = await this.questionService.close(id, para);

        const answer = await this.answerService.get(id);

        res.status(200).json({
            data: { question: question, answer: answer },
            message: "Your Discussion is Closed",
            success: true,
        });
    };

    search = async (req: Request, res: Response) => {
        const { searchTerm, id } = req.body;

        const data = await this.questionService.search(searchTerm, id);

        res.status(200).json({
            data: data,
            message: "",
            success: true,
        });
    };
}
