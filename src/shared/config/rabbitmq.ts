import ampq, { Channel, ChannelModel } from "amqplib";
import logger from "./logger";
import config from "./env";

class RabbitMQConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnecting = false;

  async connect(): Promise<Channel> {
    if (this.channel) {
      return this.channel;
    }

    if (this.isConnecting) {
      await new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });

      if (!this.channel) {
        throw new Error("RabbitMQ channel not available after connection wait");
      }

      return this.channel;
    }

    try {
      this.isConnecting = true;

      logger.info("Connecting to RabbitMQ", {
        url: config.rabbitmq.url,
      });

      this.connection = await ampq.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      const dlqName = `${config.rabbitmq.queue}.dlq`;

      // DLQ
      await this.channel.assertQueue(dlqName, {
        durable: true,
      });

      // Main Queue
      await this.channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": dlqName,
        },
      });

      logger.info("RabbitMQ connected", {
        queue: config.rabbitmq.queue,
        dlq: dlqName,
      });

      this.connection.on("close", () => {
        logger.warn("RabbitMQ connection closed");
        this.connection = null;
        this.channel = null;
      });

      this.connection.on("error", (err: Error) => {
        logger.error("RabbitMQ connection error", { err });
        this.connection = null;
        this.channel = null;
      });

      return this.channel;
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ", {error});
      throw error;
    } finally {
        this.isConnecting = false;
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  getStatus(): "connected" | "disconnected" | "closing" {
    if(!this.connection || !this.channel) {
        return "disconnected";
    }
    if(this.connection.connection?.stream?.destroyed){
        return "closing";
    }
    return "connected"
  }

  async close(): Promise<void> {
    try {
        if(this.connection){
            await this.connection.close();
            this.connection = null;
        }

        logger.info("RabbitMQ connection closed successfully");

    } catch (error) {
        logger.error("Error while closing RabbitMQ connection", { error });
    }
  }
}
export default new RabbitMQConnection();