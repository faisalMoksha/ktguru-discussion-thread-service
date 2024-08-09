import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import questionModel from "../../src/models/questionModel";

describe("PATCH /question", () => {
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
        it("should closed the question", async () => {
            // Arrange

            const question = await questionModel.create({
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
            });

            const data = {
                para: "Question is closed",
                id: question._id,
            };

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            const response = await request(app)
                .patch("/question")
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            expect(response.body.data).toHaveProperty("question");
            expect(response.body.data).toHaveProperty("answer");
            expect(response.body.data.question.isClosed).toBe(true);
            expect(response.body.data.question.summary.para).toBe(data.para);
        });
    });
});
