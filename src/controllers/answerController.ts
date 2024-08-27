import { Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AnswerService } from "../services/answerService";
import { FileStorage } from "../types";
import { MessageBroker } from "../types/broker";
import { ApiCallService } from "../services/apiCallService";
import { Config } from "../config";
import { KafKaTopic } from "../constants";
import { QuestionService } from "../services/questionService";

export class AnswerController {
    constructor(
        private answerService: AnswerService,
        private questionService: QuestionService,
        private storage: FileStorage,
        private broker: MessageBroker,
        private apiCallService: ApiCallService,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        //TODO:1. handle token if available
        //TODO:2. Implement firebase notification functionality

        const { answer, projectId, questionId, mentionUsers, model_type } =
            req.body;

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

            const question = await this.questionService.getById(questionId);

            const data = await this.answerService.create({
                answer,
                projectId,
                questionId,
                userId,
                file: fileName,
            });

            const mentionUsersArray: [string] = JSON.parse(mentionUsers);

            const askedBy = await this.answerService.getUserInfo(userId);

            const projectData: { data: string; projectName: string } =
                await this.apiCallService.getResources(projectId, model_type);

            if (!projectData) {
                const error = createHttpError(400, "Users not found");
                return next(error);
            }

            if (mentionUsersArray.length > 0) {
                for (const userId of mentionUsersArray) {
                    const getUserData =
                        await this.answerService.getUserInfo(userId);

                    const token = await this.answerService.generateToken({
                        userId,
                        answerId: String(data._id),
                    });

                    // send kafka message to mail service

                    const brokerMessage = {
                        event_type: "",
                        data: {
                            to: getUserData?.email,
                            subject: `${askedBy?.firstName} ${askedBy?.lastName} mentioned you in a Answer`,
                            context: {
                                name:
                                    getUserData?.firstName +
                                    " " +
                                    getUserData?.lastName,
                                senderName:
                                    askedBy?.firstName +
                                    " " +
                                    askedBy?.lastName,
                                answer: data.answer,
                                title: question?.title,
                                date: new Date(
                                    data.createdAt,
                                ).toLocaleDateString(),
                                projectName: projectData.projectName,
                                url: `${Config.FRONTEND_URL}/replay/${token.token}?type=answer`,
                                websiteUrl: `${Config.FRONTEND_URL}`,
                            },
                            template: "answer-notifictaion", // name of the template file i.e verify-email.hbs
                        },
                    };

                    await this.broker.sendMessage(
                        KafKaTopic.Mail,
                        JSON.stringify(brokerMessage),
                        getUserData?._id.toString(),
                    );
                }
            }

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

        const { comment, answerId, mentionUsers } = req.body;

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

            if (!data) {
                return next(createHttpError(404, "Answer not found"));
            }

            const question = await this.questionService.getById(
                String(data.questionId),
            );

            const mentionUsersArray: [string] = mentionUsers;

            const askedBy = await this.answerService.getUserInfo(userId);

            const projectId = String(data.projectId);
            const model_type = data.model_type;

            const projectData: { data: string; projectName: string } =
                await this.apiCallService.getResources(projectId, model_type);

            if (!projectData) {
                const error = createHttpError(400, "Users not found");
                return next(error);
            }

            const newComment = data.comments.slice(-1)[0];

            if (mentionUsersArray.length > 0) {
                for (const userId of mentionUsersArray) {
                    const getUserData =
                        await this.answerService.getUserInfo(userId);

                    const token = await this.answerService.generateToken({
                        userId,
                        answerId: String(data._id),
                    });

                    // send kafka message to mail service
                    const brokerMessage = {
                        event_type: "",
                        data: {
                            to: getUserData?.email,
                            subject: `${askedBy?.firstName} ${askedBy?.lastName} mentioned you in a Comment`,
                            context: {
                                name:
                                    getUserData?.firstName +
                                    " " +
                                    getUserData?.lastName,
                                senderName:
                                    askedBy?.firstName +
                                    " " +
                                    askedBy?.lastName,
                                answer: data.answer,
                                comment: newComment.comment,
                                title: question?.title,
                                date: new Date(
                                    data.createdAt,
                                ).toLocaleDateString(),
                                projectName: projectData.projectName,
                                url: `${Config.FRONTEND_URL}/replay/${token.token}?type=answer`,
                                websiteUrl: `${Config.FRONTEND_URL}`,
                            },
                            template: "comment-notifictaion", // name of the template file i.e verify-email.hbs
                        },
                    };

                    await this.broker.sendMessage(
                        KafKaTopic.Mail,
                        JSON.stringify(brokerMessage),
                        getUserData?._id.toString(),
                    );
                }
            }

            res.status(201).json(data);
        } catch (error) {
            return next(error);
        }
    };
}
