import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import questionRouter from "./routes/question";
import answerRouter from "./routes/answer";
import activityRouter from "./routes/activity";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Welcome to Project Service");
});

app.use("/question", questionRouter);
app.use("/answer", answerRouter);
app.use("/activity", activityRouter);

app.use(globalErrorHandler);

export default app;
