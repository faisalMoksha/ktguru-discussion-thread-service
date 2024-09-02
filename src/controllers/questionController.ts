import { Request, Response, NextFunction } from "express";
import { Request as AuthRequest } from "express-jwt";
import createHttpError from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import { validationResult } from "express-validator";
import { FileStorage, Resources } from "../types";
import { Config } from "../config";
import { MessageBroker } from "../types/broker";
import { KafKaTopic, MailEvents } from "../constants";
import { ApiCallService } from "../services/apiCallService";
import { TokenService } from "../services/tokenService";

export class QuestionClass {
    constructor(
        private questionService: QuestionService,
        private answerService: AnswerService,
        private storage: FileStorage,
        private broker: MessageBroker,
        private apiCallService: ApiCallService,
        private tokenService: TokenService,
    ) {}

    create = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { title, description, projectId, model_type, mentionUsers } =
            req.body;

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
                model_type,
                userId,
                file: fileName,
            });

            const mentionUsersArray: [string] = mentionUsers
                ? JSON.parse(mentionUsers)
                : [];

            const askedBy = await this.answerService.getUserInfo(userId);

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
                        questionId: String(data._id),
                        projectId: projectId,
                    });

                    // send kafka message to mail service
                    const brokerMessage = {
                        event_type: MailEvents.SEND_MAIL,
                        data: {
                            to: getUserData?.email,
                            subject: `${askedBy?.firstName} ${askedBy?.lastName} mentioned you in a question`,
                            context: {
                                name:
                                    getUserData?.firstName +
                                    " " +
                                    getUserData?.lastName,
                                senderName:
                                    askedBy?.firstName +
                                    " " +
                                    askedBy?.lastName,
                                title: data.title,
                                desc: data.description,
                                date: new Date(
                                    data.createdAt,
                                ).toLocaleDateString(),
                                projectName: projectData.projectName,
                                url: `${Config.FRONTEND_URL}/replay/${token.token}?type=answer`,
                                websiteUrl: `${Config.FRONTEND_URL}`,
                            },
                            template: "question-notifictaion", // name of the template file i.e verify-email.hbs
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
                        title: `New Question Asked By: ${askedBy?.firstName} ${askedBy?.lastName}`,
                        body: `${title}`,
                        to: projectData.data,
                    },
                };

                await this.broker.sendMessage(
                    KafKaTopic.Mail,
                    JSON.stringify(brokerMessage),
                    askedBy?.userId.toString(),
                );
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
