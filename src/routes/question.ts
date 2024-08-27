import express from "express";
import fileUpload from "express-fileupload";
import { QuestionClass } from "../controllers/questionController";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../utils/wrapper";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import questionValidator from "../validators/question-validator";
import { S3Storage } from "../services/S3Storage";
import createHttpError from "http-errors";
import { createMessageBroker } from "../utils/factories/brokerFactory";
import { ApiCallService } from "../services/apiCallService";

const router = express.Router();

const questionService = new QuestionService();
const answerService = new AnswerService();
const broker = createMessageBroker();
const apiCallService = new ApiCallService();

const s3Storage = new S3Storage();

const questionClass = new QuestionClass(
    questionService,
    answerService,
    s3Storage,
    broker,
    apiCallService,
);

/**
 * ask question endpoint
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
    questionValidator,
    asyncWrapper(questionClass.create),
);

/**
 * get question and answers endpoint
 */
router.get("/:id", authenticate, asyncWrapper(questionClass.get));

/**
 * get all questions endpoint
 */
router.post("/all", authenticate, asyncWrapper(questionClass.getAll));

/**
 * closed questions endpoint
 */
router.patch(
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
    asyncWrapper(questionClass.close),
);

/**
 * search questions endpoint
 */
router.post("/search", authenticate, asyncWrapper(questionClass.search));

export default router;
