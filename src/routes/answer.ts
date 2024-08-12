import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import { AnswerController } from "../controllers/answerController";
import { AnswerService } from "../services/answerService";
import authenticate from "../middlewares/authenticate";
import answerValidator from "../validators/answer-validator";
import fileUpload from "express-fileupload";
import createHttpError from "http-errors";
import { S3Storage } from "../services/S3Storage";

const router = express.Router();

const answerService = new AnswerService();
const s3Storage = new S3Storage();

const answerController = new AnswerController(answerService, s3Storage);

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

export default router;
