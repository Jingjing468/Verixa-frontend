import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await testDatabaseConnection();
    console.log("PostgreSQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Verixa API running on http://localhost:${PORT}`);
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    console.error("Failed to connect to PostgreSQL:", message);
    process.exit(1);
  }
};

void startServer();
