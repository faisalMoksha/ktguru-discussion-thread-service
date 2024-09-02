import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import questionModel from "../../src/models/questionModel";
import userCacheModel from "../../src/models/userCacheModel";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("POST /question", () => {
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
            const data = {
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
                // mentionUsers: [],
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

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

            const response = await request(app)
                .post("/question")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            console.log("response.body:", response.body);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should persist the question data in the databse", async () => {
            // Arrange
            const data = {
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
                // mentionUsers: [],
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
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

            await request(app)
                .post("/question")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            const findQuestion = await questionModel.find();

            expect(findQuestion).toHaveLength(1);
            expect(findQuestion[0].title).toBe(data.title);
            expect(findQuestion[0].description).toBe(data.description);
            expect(findQuestion[0].projectId.toString()).toBe(data.projectId);
        });
    });
});
