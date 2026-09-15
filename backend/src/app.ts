import express from "express";
import cors from "cors";
import { testDatabaseConnection } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import recipientRoutes from "./routes/recipient.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import supportRoutes from "./routes/support.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/recipients", recipientRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/verify", verificationRoutes);
app.use("/api/v1", supportRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Verixa API is running",
  });
});

app.get("/api/v1/health/database", async (_req, res) => {
  try {
    await testDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "PostgreSQL connection is healthy",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    console.error("PostgreSQL health check failed:", message);

    res.status(503).json({
      success: false,
      message: "PostgreSQL connection is unhealthy",
    });
  }
});

export default app;
