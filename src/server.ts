import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./shared/config/logger";
import errorHandler from "./shared/middleware/errorHandler";
import mongodb from "./shared/config/mongodb";
import postgres from "./shared/config/postgres";
import rabbitmq from "./shared/config/rabbitmq";
import type { Server } from "http";
import { version } from "winston";
import { set } from "mongoose";
import config from "./shared/config/env";

/*
 * Initialize the Express app
 */
const app = express();

/*
 *Middleware
 */
app.use(helmet()); // Security
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler); // Error handling

/*
 * Request Logger
 */
app.use((req: Request, res: Response, next: NextFunction): void => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
});

/*
 * Health Check Endpoint
 */
app.get("/health", (_req: Request, res: Response, next: NextFunction) => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        status: "Healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
      "Server is healthy",
    ),
  );
});

/*
 * Root Endpoint
 */
app.get("/", (_req: Request, res: Response): void => {
  res.status(200).json(
    ResponseFormatter.success(
      {
        service: "Api Hit Monitoring Service",
        version: "1.0.0",
        endpoint: {
          health: "/health",
          auth: "/api/auth",
          ingest: "/api/hit",
          analytics: "/api/analytics",
        },
      },
      "Api Hit Monitoring Service",
    ),
  );
});

/*
 * 404 Handler
 */
app.use((_req: Request, res: Response): void => {
  res.status(404).json(ResponseFormatter.error("Not Found", 404));
});

async function intializeServer(): Promise<void> {
  try {
    logger.info("Initializing database connection");
    await mongodb.connect();
    await postgres.testConnection();
    await rabbitmq.connect();

    logger.info("All connections established successfully");
  } catch (error) {
    logger.error("Failed to initialize connection", error);
    process.exit(1);
  }
}

async function GracefulShutdown(
  server: Server,
  signal: NodeJS.Signals | string,
): Promise<void> {
  logger.info(`${signal} recieved, shutting down gracefully...`);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await mongodb.disconnect();
      await postgres.close();
      await rabbitmq.close();

      logger.info("All connections closed. Exiting process.");
      process.exit(1);
    } catch (error) {
      logger.error("Error during shutdown", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.warn("Force shutdown after timeout");
    process.exit(1);
  }, 10_000);
}

async function startServer(): Promise<void> {
  try {
    await intializeServer();

    const server: Server = app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`);
      logger.info(`Environment: ${config.node_env}`);
      logger.info(`Api available at http://localhost:${config.port}`);
    });

    process.on("SIGTERM", () => {
      void GracefulShutdown(server, "SIGTERM");
    });

    process.on("SIGINT", () => {
      void GracefulShutdown(server, "SIGINT");
    });

    process.on("uncaughtException", (err: Error) => {
      logger.error("Uncaught Exception", err);
      void GracefulShutdown(server, "uncaughtException");
    });

    process.on("unhandledRejection", (reason: unknown) => {
      logger.error("Unhandled Rejection", reason);
      void GracefulShutdown(server, "unhandledRejection");
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    throw error;
  }
}

void startServer();
