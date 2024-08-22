import { Config } from "../../config";
import { KafkaBroker } from "../../config/kafka";
import logger from "../../config/logger";
import { MessageBroker } from "../../types/broker";

let broker: MessageBroker | null = null;

export const createMessageBroker = (): MessageBroker => {
    logger.info("Connecting to Kafka broker...");

    if (!broker) {
        broker = new KafkaBroker("discussion-service", [Config.KAFKA_BROKER!]);
    }

    return broker;
};
