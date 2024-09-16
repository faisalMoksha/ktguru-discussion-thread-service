import { Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { AnswerService } from "../services/answerService";
import { FileStorage, Resources } from "../types";
import { MessageBroker } from "../types/broker";
import { ApiCallService } from "../services/apiCallService";
import { Config } from "../config";
import { KafKaTopic, MailEvents } from "../constants";
import { QuestionService } from "../services/questionService";
import { TokenService } from "../services/tokenService";

export class AnswerController {
    constructor(
        private answerService: AnswerService,
        private questionService: QuestionService,
        private storage: FileStorage,
        private broker: MessageBroker,
        private apiCallService: ApiCallService,
        private tokenService: TokenService,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
            let fileType = "";
            if (req.files) {
                const file = req.files.file as UploadedFile;

                fileName = uuidv4();
                // Extract file type from mimetype
                fileType = file.mimetype;

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
                fileType,
            });

            const mentionUsersArray: [string] = mentionUsers
                ? JSON.parse(mentionUsers)
                : [];

            const user = await this.answerService.getUserInfo(userId);

            const projectData: { data: Resources[]; projectName: string } =
                await this.apiCallService.getResources(projectId, model_type);

            if (!projectData) {
                const error = createHttpError(400, "Users not found");
                return next(error);
            }

            if (mentionUsersArray.length > 0) {
                for (const userId of mentionUsersArray) {
                    const getUserData =
                        await this.answerService.getUserInfo(userId);

                    const token = await this.tokenService.create({
                        userId,
                        answerId: String(data._id),
                    });

                    // send kafka message to mail service

                    if (Config.NODE_ENV != "test") {
                        const brokerMessage = {
                            event_type: MailEvents.SEND_MAIL,
                            data: {
                                to: getUserData?.email,
                                subject: `${user?.firstName} ${user?.lastName} mentioned you in a Answer`,
                                context: {
                                    name:
                                        getUserData?.firstName +
                                        " " +
                                        getUserData?.lastName,
                                    senderName:
                                        user?.firstName + " " + user?.lastName,
                                    answer: data.answer,
                                    title: question?.title,
                                    date: new Date(
                                        data.createdAt,
                                    ).toLocaleDateString(),
                                    projectName: projectData.projectName,
                                    url: `${Config.FRONTEND_URL}/replay/${token.token}?type=comment`,
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
            }

            if (Config.NODE_ENV != "test") {
                const brokerMessage = {
                    event_type: MailEvents.SEND_FIREBASE_NOTIFICATION,
                    data: {
                        title: `New Answer Given By: ${user?.firstName} ${user?.lastName}`,
                        body: `${answer}`,
                        to: projectData.data,
                    },
                };

                await this.broker.sendMessage(
                    KafKaTopic.Mail,
                    JSON.stringify(brokerMessage),
                    user?.userId.toString(),
                );
            }

            const answerData = await this.answerService.get(questionId);

            res.status(201).json({
                data: { question: question, answer: answerData },
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

            const mentionUsersArray: [string] = mentionUsers
                ? mentionUsers
                : [];

            const user = await this.answerService.getUserInfo(userId);

            const projectId = String(data.projectId);
            const model_type = data.model_type;

            const projectData: { data: Resources[]; projectName: string } =
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

                    const token = await this.tokenService.create({
                        userId,
                        answerId: String(data._id),
                    });

                    // send kafka message to mail service
                    const brokerMessage = {
                        event_type: MailEvents.SEND_MAIL,
                        data: {
                            to: getUserData?.email,
                            subject: `${user?.firstName} ${user?.lastName} mentioned you in a Comment`,
                            context: {
                                name:
                                    getUserData?.firstName +
                                    " " +
                                    getUserData?.lastName,
                                senderName:
                                    user?.firstName + " " + user?.lastName,
                                answer: data.answer,
                                comment: newComment.comment,
                                title: question?.title,
                                date: new Date(
                                    data.createdAt,
                                ).toLocaleDateString(),
                                projectName: projectData.projectName,
                                url: `${Config.FRONTEND_URL}/replay/${token.token}?type=comment`,
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

            if (Config.NODE_ENV != "test") {
                const brokerMessage = {
                    event_type: MailEvents.SEND_FIREBASE_NOTIFICATION,
                    data: {
                        title: `${user?.firstName} ${user?.lastName}: comment on answer`,
                        body: `${comment}`,
                        to: projectData.data,
                    },
                };

                await this.broker.sendMessage(
                    KafKaTopic.Mail,
                    JSON.stringify(brokerMessage),
                    user?.userId.toString(),
                );
            }

            const answerData = await this.answerService.get(
                String(data.questionId),
            );

            res.status(201).json({
                data: { question: question, answer: answerData },
                message: "",
                success: true,
            });
        } catch (error) {
            return next(error);
        }
    };

    savedReply = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ) => {
        const { type, reply, token } = req.body;

        try {
            const tokenData = await this.tokenService.get(token);

            if (!tokenData) {
                const error = createHttpError(404, "Invalid token");
                return next(error);
            }

            let fileName = null;
            let fileType = "";
            if (req.files) {
                const file = req.files.file as UploadedFile;

                fileName = uuidv4();
                // Extract file type from mimetype
                fileType = file.mimetype;

                await this.storage.upload({
                    filename: fileName,
                    fileData: file.data.buffer,
                });
            }

            const data = await this.answerService.savedReply({
                type,
                answerId: tokenData.answerId,
                questionId: tokenData.questionId,
                reply,
                fileName,
                fileType,
                projectId: tokenData.projectId,
            });

            res.status(200).json({
                data,
                message: "Your message saved successfully",
            });
        } catch (error) {
            return next(error);
        }
    };
}
