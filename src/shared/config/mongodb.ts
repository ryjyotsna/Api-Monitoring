import mongoose, { Connection } from "mongoose";
import logger from "./logger";
import config from "./env";

/**
 * MongoDB database connection
 */
class MongoConnection {
  private connection: Connection | null;

  constructor() {
    this.connection = null;
  }

  /**
   * connect ton MongoDB
   * @returns
   */

  async connect(): Promise<Connection> {
    try {
      if (this.connection) {
        logger.info("MongoDB is already connected");
        return this.connection;
      }

      await mongoose.connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      });

      this.connection = mongoose.connection;

      logger.info(`Mongo connected: ${config.mongo.uri}`);

      this.connection.on("error", (err: Error) => {
        logger.warn("MongoDB connection error", { err });
      });
      this.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
        this.connection = null;
      });
      return this.connection;
    } catch (error) {
      logger.error("Failed to connect to MongoDB", { error });
      throw error;
    }
  }

  /**
   * Disconnect MongoDB
   */

  async disconnect(): Promise<void> {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info("MongoDB disconnected");
      }
    } catch (error) {
      logger.error("Failed to disconnect MongoDB", { error });
      throw error;
    }
  }

  /**
   * Get Active connection
   * @returns {Connection}
   */

  getConnection(): Connection | null {
    return this.connection;
  }
}

export default new MongoConnection();
