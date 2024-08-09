import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import { AnswerController } from "../controllers/answerController";
import { AnswerService } from "../services/answerService";
import authenticate from "../middlewares/authenticate";

const router = express.Router();

const answerService = new AnswerService();
const answerController = new AnswerController(answerService);

router.post("/", authenticate, asyncWrapper(answerController.create));

router.post(
    "/comment",
    authenticate,
    asyncWrapper(answerController.addComment),
);

export default router;
