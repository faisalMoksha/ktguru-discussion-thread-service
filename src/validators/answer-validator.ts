import { checkSchema } from "express-validator";

export default checkSchema({
    answer: {
        trim: true,
        notEmpty: true,
        isString: true,
        errorMessage: "Title is required!",
    },
    questionId: {
        trim: true,
        isString: true,
        errorMessage: "Question Id is required!",
    },
    projectId: {
        trim: true,
        isString: true,
        errorMessage: "Project Id is required!",
    },
});
