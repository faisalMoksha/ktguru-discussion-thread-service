import { Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AnswerService } from "../services/answerService";
import { FileStorage } from "../types";

export class AnswerController {
    constructor(
        private answerService: AnswerService,
        private storage: FileStorage,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        //TODO:1. handle token if available
        //TODO:2. Implement firebase notification functionality
        //TODO:3  Implement send mail functionality to mentionUsers
        //TODO:4  Populate users data

        const { answer, projectId, questionId } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            if (!req.auth || !req.auth.sub) {
                return next(
                    createHttpError(400, "Unauthorized access to give answer"),
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

            const data = await this.answerService.create({
                answer,
                projectId,
                questionId,
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

    addComment = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ) => {
        //TODO:1. handle token if available
        //TODO:2. Implement firebase notification functionality
        //TODO:3  Implement send mail functionality to mentionUsers
        //TODO:4  Populate users data

        const { comment, answerId } = req.body;

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

            const data = await this.answerService.addComment(
                comment,
                answerId,
                userId,
            );

            res.status(201).json(data);
        } catch (error) {
            return next(error);
        }
    };
}
