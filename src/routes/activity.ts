import express from "express";
import { ActivityController } from "../controllers/activityController";
import { asyncWrapper } from "../utils/wrapper";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";

const router = express.Router();

const questionService = new QuestionService();
const answerService = new AnswerService();

const activityController = new ActivityController(
    questionService,
    answerService,
);

router.get("/:projectId/:skipCount", asyncWrapper(activityController.get));

export default router;
