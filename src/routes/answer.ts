import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import { AnswerController } from "../controllers/answerController";
import { AnswerService } from "../services/answerService";
import authenticate from "../middlewares/authenticate";
import answerValidator from "../validators/answer-validator";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { S3Storage } from "../services/S3Storage";
import { QuestionService } from "../services/questionService";
import { ApiCallService } from "../services/apiCallService";
import { createMessageBroker } from "../utils/factories/brokerFactory";
import { TokenService } from "../services/tokenService";

const router = express.Router();

const answerService = new AnswerService();
const questionService = new QuestionService();
const broker = createMessageBroker();
const apiCallService = new ApiCallService();
const tokenService = new TokenService();

const s3Storage = new S3Storage();

const answerController = new AnswerController(
    answerService,
    questionService,
    s3Storage,
    broker,
    apiCallService,
    tokenService,
);

/**
 * give answer endpoint
 */
router.post(
    "/",
    authenticate,
    fileUpload({
        limits: { fileSize: 500 * 1024 }, //500kb
        abortOnLimit: true,
        limitHandler: (req, res, next) => {
            const error = createHttpError(400, "File size exceeded the limit");
            next(error);
        },
    }),
    answerValidator,
    asyncWrapper(answerController.create),
);

/**
 * give comment endpoint
 */
router.post(
    "/comment",
    authenticate,
    asyncWrapper(answerController.addComment),
);

/**
 * replay from mail endpoint
 */
router.post("/reply", asyncWrapper(answerController.savedReply));

export default router;
