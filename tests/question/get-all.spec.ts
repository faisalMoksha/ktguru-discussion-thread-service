import request from "supertest";
import mongoose from "mongoose";
import createJWKSMock from "mock-jwks";
import app from "../../src/app";
import { Config } from "../../src/config";
import { Roles } from "../../src/constants";
import questionModel from "../../src/models/questionModel";

describe("POST /question/all", () => {
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
                projectId: "651d94b37c81f740f30892de",
                isClosed: false,
                skipCount: 0,
            };

            await questionModel.create({
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
            });

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            const response = await request(app)
                .post(`/question/all`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            expect(response.statusCode).toBe(200);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("json"),
            );
        });
        it("should return data match with project id", async () => {
            // Arrange

            const data = {
                projectId: "651d94b37c81f740f30892de",
                isClosed: false,
                skipCount: 0,
            };

            await questionModel.create({
                title: "Why is req.body undefined in Express?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "651d94b37c81f740f30892de",
            });

            await questionModel.create({
                title: "Why is req.body is null?",
                description:
                    "I am creating a PUT method to update a given set of data however in my update function, req.body is undefined.",
                projectId: "6512a4c42a6759c77211668e",
            });

            // Assert
            const accessToken = jwks.token({
                sub: "6512a4c42a6759c77211660e",
                role: Roles.PROJECT_ADMIN,
            });

            const response = await request(app)
                .post(`/question/all`)
                .set("Cookie", [`accessToken=${accessToken}`])
                .send(data);

            // Assert
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].projectId).toBe(data.projectId);
        });
    });
});
