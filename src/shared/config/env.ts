import dotenv from "dotenv";

dotenv.config();

const config = {
  //Server
  node_env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),

  //Mongodb
  mongo: {
    uri: process.env.MONGO_URI || "mongodb//localhost:27017/api_monitoring",
    dbName: process.env.MONGO_DB_NAME || "api_monitoring",
  },

  //postgreSQL
  postgres: {
    host: process.env.PG_HOST || "localhost",
    port: parseInt(process.env.PG_PORT || "5432", 10),
    database: process.env.PG_USER || "postgres",
  },

  //rabbitMQ
  rabbitmq: {
    url: process.env.RBBITMQ_URL || "ampq://localhost:5672",
    queue: process.env.RABBITMQ_QUEUE || "api_hits",
    publisherConfirms:
      process.env.RABBITMQ_PUBLISHER_CONFIRMS === "true" || "false",
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || "3", 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || "1000", 10),
  },

  //JWT
  jwt: {
    secret: process.env.JWT_SECRET || "DNKSUEHIUHF3UE83UE@3jhiuwhdue",
    expiresIn: process.env.JWT_EXPRESS_IN || "24",
  },

  //Rate Limiting
  rateLimiting: {
    windows: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), //15min
    maxRequest: parseInt(process.env.RATE_LIMIT_MAX_REQUEST || "1000", 10), //1000 REQ/15 min per IP
  },
};

export default config;
