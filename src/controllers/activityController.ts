import { Request, Response, NextFunction } from "express";
import { QuestionService } from "../services/questionService";
import { AnswerService } from "../services/answerService";
import { Answer, Comments, Question } from "../types";

type TimelineItem = Question | Answer | Comments;

export class ActivityController {
    constructor(
        private questionService: QuestionService,
        private answerService: AnswerService,
    ) {}

    get = async (req: Request, res: Response, next: NextFunction) => {
        const limit = 10;
        const skip = req.params.skipCount;
        const result = limit * Number(skip);

        const projectId = req.params.projectId;

        try {
            const questionData: Question[] =
                await this.questionService.getQuestionsForActivity(
                    projectId,
                    result,
                    limit,
                );

            const answerData: Answer[] =
                await this.answerService.getAnswerForActivity(
                    projectId,
                    result,
                    limit,
                );

            let commentData: Comments[] = [];
            answerData.forEach((answer) => {
                commentData = commentData.concat(answer.comments);
            });

            // Combine question data, answer data, and comment data into a timeline with newest data
            const timelineData: TimelineItem[] = [
                ...questionData,
                ...answerData,
                ...commentData,
            ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            res.status(200).json(timelineData);
        } catch (error) {
            return next(error);
        }
    };
}
