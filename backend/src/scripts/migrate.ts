import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../config/database.js";

type MigrationRow = {
  name: string;
};

const migrationsDir = path.resolve(process.cwd(), "src/migrations");

const ensureMigrationsTable = async (): Promise<void> => {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const getAppliedMigrationNames = async (): Promise<Set<string>> => {
  const result = await pool.query<MigrationRow>(
    "SELECT name FROM schema_migrations ORDER BY name ASC"
  );

  return new Set(result.rows.map((row) => row.name));
};

const getMigrationFileNames = async (): Promise<string[]> => {
  const fileNames = await readdir(migrationsDir);

  return fileNames
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort((first, second) => first.localeCompare(second));
};

const runMigration = async (fileName: string): Promise<void> => {
  const filePath = path.join(migrationsDir, fileName);
  const sql = await readFile(filePath, "utf8");
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [fileName]);
    await client.query("COMMIT");
    console.log(`Applied migration: ${fileName}`);
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const migrate = async (): Promise<void> => {
  try {
    await ensureMigrationsTable();

    const appliedMigrationNames = await getAppliedMigrationNames();
    const migrationFileNames = await getMigrationFileNames();
    const pendingMigrationFileNames = migrationFileNames.filter(
      (fileName) => !appliedMigrationNames.has(fileName)
    );

    if (pendingMigrationFileNames.length === 0) {
      console.log("No pending migrations");
      return;
    }

    for (const fileName of pendingMigrationFileNames) {
      await runMigration(fileName);
    }

    console.log("Migrations completed successfully");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown migration error";

    console.error("Migration failed:", message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void migrate();
