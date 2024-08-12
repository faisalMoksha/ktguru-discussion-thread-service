import { Request, Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import { validationResult } from "express-validator";
import { FileStorage } from "../types";

export class QuestionClass {
    constructor(
        private questionService: QuestionService,
        private answerService: AnswerService,
        private storage: FileStorage,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        //TODO:1. Populate users data
        //TODO:2. Implement firebase notification functionality
        //TODO:3  Implement send mail functionality to mentionUsers

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

            let fileName = null;
            if (req.files) {
                const file = req.files.file as UploadedFile;

                fileName = uuidv4();

                await this.storage.upload({
                    filename: fileName,
                    fileData: file.data.buffer,
                });
            }

            const data = await this.questionService.create({
                title,
                description,
                projectId,
                userId,
                file: fileName,
            });

            res.status(201).json({
                data: data,
                message: "",
                success: true,
            });
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
        const { projectId, isClosed, skipCount } = req.body;

        const data = await this.questionService.getAll(
            projectId,
            isClosed,
            skipCount,
        );

        res.status(200).json({ data: data, message: "", success: true });
    };

    close = async (req: Request, res: Response) => {
        const { para, id } = req.body;

        let fileName = null;
        if (req.files) {
            const file = req.files.file as UploadedFile;

            fileName = uuidv4();

            await this.storage.upload({
                filename: fileName,
                fileData: file.data.buffer,
            });
        }

        const question = await this.questionService.close(id, para, fileName);

        const answer = await this.answerService.get(id);

        res.status(200).json({
            data: { question: question, answer: answer },
            message: "Your Discussion is Closed",
            success: true,
        });
    };

    search = async (req: Request, res: Response) => {
        const { searchTerm, projectId } = req.body;

        const data = await this.questionService.search(searchTerm, projectId);

        res.status(200).json({
            data: data,
            message: "",
            success: true,
        });
    };
}
