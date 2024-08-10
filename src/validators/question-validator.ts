import { checkSchema } from "express-validator";

export default checkSchema({
    title: {
        trim: true,
        notEmpty: true,
        isString: true,
        errorMessage: "Title is required!",
    },
    description: {
        trim: true,
        notEmpty: true,
        isString: true,
        errorMessage: "Description is required!",
    },
    projectId: {
        trim: true,
        isString: true,
        errorMessage: "Project Id is required!",
    },
});
