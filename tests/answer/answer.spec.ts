import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import questionModel from "../../src/models/questionModel";
import answerModel from "../../src/models/answerModel";
import userCacheModel from "../../src/models/userCacheModel";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("POST /answer", () => {
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeEach(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        jwks.start();
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    afterEach(async () => {
        await mongoose.connection.close();
        jwks.stop();
    });

    describe("Given Field", () => {
        it("should return status code 201 and valid json response", async () => {
            // Arrange
            const question = await questionModel.create({
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
            });

            const data = {
                answer: "You should use a body parser. Basically, Express can't know how to parse the incoming data the users throw at it, so you need to parse the data for it.",
                questionId: question._id,
                projectId: "651d94b37c81f740f30892de",
                // mentionUsers: [],
            };

            await userCacheModel.create({
                userId: "6512a4c42a6759c77211660e",
            });

            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    projectName: "project-name",
                    data: {
                        userId: "6512a4c42a6759c77211660e",
                        userRole: "string",
                        isApproved: true,
                        status: "string",
                        createdAt: new Date(),
                    },
                },
            });

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            const response = await request(app)
                .post("/answer")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should persist the answer data in the databse", async () => {
            // Arrange
            const question = await questionModel.create({
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
            });

            const data = {
                answer: "You should use a body parser. Basically, Express can't know how to parse the incoming data the users throw at it, so you need to parse the data for it.",
                questionId: question._id,
                projectId: "651d94b37c81f740f30892de",
                // mentionUsers: [],
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            await request(app)
                .post("/answer")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            const findAnswer = await answerModel.find();

            expect(findAnswer).toHaveLength(1);
            expect(findAnswer[0].answer).toBe(data.answer);
            expect(findAnswer[0].questionId).toStrictEqual(data.questionId);
            expect(findAnswer[0].projectId.toString()).toBe(data.projectId);
        });
    });
});
