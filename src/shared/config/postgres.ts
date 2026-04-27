import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import config from "./env";
import logger from "./logger";

class PostgresConnection {
  private pool: Pool | null;

  constructor() {
    this.pool = null;
  }

  getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on("error", (err: Error) => {
        logger.error("Unexpected error on idle PG client", { err });
      });

      logger.info("PostgreSQL pool created");
    }
    return this.pool;
  }

  async testConnection(): Promise<void> {
    try {
      const pool = this.getPool();
      const client: PoolClient = await pool.connect();

      const result: QueryResult = await client.query("SELECT NOW()");
      client.release();

      logger.info("PostgreSQL connected succesfully", {
        time: result.rows[0].now,
      });
    } catch (error) {
      logger.error("Failed to connect to PostgreSQL", { error });
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    const pool = this.getPool();
    const start = Date.now();

    try {
      const result: QueryResult<T> = await pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug("Executed Query", {
        text,
        duration,
        rows: result.rowCount,
      });

      return result;
    } catch (error) {
      logger.error("Query execution failed", {
        text,
        error,
      });
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.end();
        this.pool = null;

        logger.info("PostreSql pool closed");
      }
    } catch (error) {
      logger.info("Failed to close PostreSQL pool", { error });
      throw error;
    }
  }
}
export default new PostgresConnection();
