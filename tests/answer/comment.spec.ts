import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import answerModel from "../../src/models/answerModel";
import userCacheModel from "../../src/models/userCacheModel";

describe("POST /answer/comment", () => {
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
            const answer = await answerModel.create({
                answer: "You should use a body parser. Basically, Express can't know how to parse the incoming data the users throw at it, so you need to parse the data for it.",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
                questionId: "651d94b37c81f740f308928e",
            });

            const data = {
                answerId: answer._id,
                comment:
                    "You should use a body parser. Basically, Express can't know how to parse the.",
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            await userCacheModel.create({
                userId: "6512a4c42a6759c77211660e",
            });

            const response = await request(app)
                .post("/answer/comment")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            expect(response.statusCode).toBe(201);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should persist the comment data in the databse", async () => {
            // Arrange
            const answer = await answerModel.create({
                answer: "You should use a body parser. Basically, Express can't know how to parse the incoming data the users throw at it, so you need to parse the data for it.",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
                questionId: "651d94b37c81f740f308928e",
                userId: "6512a4c42a6759c77211660e",
            });

            const data = {
                answerId: answer._id,
                comment: "Basically, Express can't know how to parse the.",
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            await request(app)
                .post("/answer/comment")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            const findComment = await answerModel.find();

            expect(findComment).toHaveLength(1);
            expect(findComment[0].comments[0].comment).toBe(data.comment);
            expect(findComment[0].comments[0].answerId).toStrictEqual(
                answer._id,
            );
            expect(findComment[0].comments[0].userId.toString()).toBe(
                "6512a4c42a6759c77211660e",
            );
        });
    });
});
