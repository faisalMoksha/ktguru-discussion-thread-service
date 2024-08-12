import createHttpError from "http-errors";
import { Config } from "../config";
import { FileData, FileStorage } from "../types";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: Config.S3_REGION!,
            credentials: {
                accessKeyId: Config.S3_ACCESS_KEY!,
                secretAccessKey: Config.S3_SECRET_KEY!,
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams = {
            Bucket: Config.S3_BUCKET!,
            Key: data.filename,
            Body: data.fileData,
        };

        // todo: add proper filedata type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new PutObjectCommand(objectParams));
    }

    delete(): void {}

    getObjectUri(filename: string): string {
        // https://ktguru.s3.eu-north-1.amazonaws.com/5962624d-1b9e-4c96-b1d6-395ca9ef4933
        const bucket = Config.S3_BUCKET;
        const region = Config.S3_REGION;

        if (typeof bucket === "string" && typeof region === "string") {
            return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
        }
        const error = createHttpError(500, "Invalid S3 configuration");
        throw error;
    }
}
