import { Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import { AnswerService } from "../services/answerService";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

export class AnswerController {
    constructor(private answerService: AnswerService) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        //TODO:1. Implement file upload functionality
        //TODO:2. Implement firebase notification functionality
        //TODO:3  Implement send mail functionality to mentionUsers
        //TODO:4  Populate users data
        //TODO:5  handle token if available

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

            const data = await this.answerService.create({
                answer,
                projectId,
                questionId,
                userId,
            });

            res.status(201).json(data);
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
