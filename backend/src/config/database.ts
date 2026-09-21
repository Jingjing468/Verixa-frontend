import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolConfig } from "pg";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(configDirectory, "../..", ".env") });

const requiredDatabaseEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
] as const;

type DatabaseEnvVar = (typeof requiredDatabaseEnvVars)[number];

const getRequiredEnv = (name: DatabaseEnvVar): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

const parseDatabasePort = (value: string): number => {
  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("DB_PORT must be a valid TCP port number");
  }

  return port;
};

const getPoolConfig = (): PoolConfig => {
  const ssl = process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined;

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl,
    };
  }

  return {
    host: getRequiredEnv("DB_HOST"),
    port: parseDatabasePort(getRequiredEnv("DB_PORT")),
    database: getRequiredEnv("DB_NAME"),
    user: getRequiredEnv("DB_USER"),
    password: getRequiredEnv("DB_PASSWORD"),
    ssl,
  };
};

export const pool = new Pool(getPoolConfig());

export const testDatabaseConnection = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query<{ now: Date }>("SELECT NOW()");
  } finally {
    client.release();
  }
};
