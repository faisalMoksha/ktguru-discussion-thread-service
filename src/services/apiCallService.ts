import axios from "axios";
import { Config } from "../config";

export class ApiCallService {
    async getResources(projectId: string, model_type: string) {
        try {
            const response = await axios.post(
                `${Config.PROJECT_SERVICE_URI}/resources/users`,
                {
                    model_type,
                    projectId,
                },
            );

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw error.response?.data;
            } else {
                throw error;
            }
        }
    }
}
