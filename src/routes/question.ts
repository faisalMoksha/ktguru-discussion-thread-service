import express from "express";
import { QuestionClass } from "../controllers/questionController";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../utils/wrapper";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import questionValidator from "../validators/question-validator";

const router = express.Router();

const questionService = new QuestionService();
const answerService = new AnswerService();
const questionClass = new QuestionClass(questionService, answerService);

/**
 * ask question endpoint
 */
router.post(
    "/",
    authenticate,
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
router.patch("/", authenticate, asyncWrapper(questionClass.close));

/**
 * search questions endpoint
 */
router.post("/search", authenticate, asyncWrapper(questionClass.search));

export default router;
