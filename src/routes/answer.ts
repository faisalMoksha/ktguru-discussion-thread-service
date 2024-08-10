import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import { AnswerController } from "../controllers/answerController";
import { AnswerService } from "../services/answerService";
import authenticate from "../middlewares/authenticate";
import answerValidator from "../validators/answer-validator";

const router = express.Router();

const answerService = new AnswerService();
const answerController = new AnswerController(answerService);

/**
 * give answer endpoint
 */
router.post(
    "/",
    authenticate,
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
