import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    FRONTEND_URL,
    JWKS_URI,
    USER_SERVICE_URI,
    PROJECT_SERVICE_URI,
    S3_SECRET_KEY,
    S3_ACCESS_KEY,
    S3_REGION,
    S3_BUCKET,
    KAFKA_BROKER,
    KAFKA_SASL_USER_NAME,
    KAFKA_SASL_PASSWORD,
} = process.env;

export const Config = {
    NODE_ENV,
    PORT,
    MONGO_URI,
    FRONTEND_URL,
    JWKS_URI,
    USER_SERVICE_URI,
    PROJECT_SERVICE_URI,
    S3_SECRET_KEY,
    S3_ACCESS_KEY,
    S3_REGION,
    S3_BUCKET,
    KAFKA_BROKER,
    KAFKA_SASL_USER_NAME,
    KAFKA_SASL_PASSWORD,
};
