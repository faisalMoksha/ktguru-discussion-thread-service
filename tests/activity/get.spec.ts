import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import questionModel from "../../src/models/questionModel";
import answerModel from "../../src/models/answerModel";
import userCacheModel from "../../src/models/userCacheModel";

describe("GET /activity/:projectId/:skipCount", () => {
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
                userId: "6512a4c42a6759c77211669e",
            });

            const answer = await answerModel.create({
                answer: "You should use a body parser. Basically, Express can't know how to parse the incoming data the users throw at it, so you need to parse the data for it.",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
                questionId: question._id,
                userId: "6512a4c42a6759c77211660e",
            });

            await answerModel.findByIdAndUpdate(answer._id, {
                $push: {
                    comments: {
                        comment: "comment",
                        userId: "6512a4c42a6759c77211660e",
                        answerId: answer._id,
                    },
                },
            });

            await userCacheModel.create({
                userId: "6512a4c42a6759c77211660e",
            });

            await userCacheModel.create({
                userId: "6512a4c42a6759c77211669e",
            });

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            const response = await request(app)
                .get(`/activity/651d94b37c81f740f30892de/${0}`)
                .set("Cookie", [`accessToken=${accessToken}`]);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
            expect(response.body).toHaveLength(3);
        });
    });
});
