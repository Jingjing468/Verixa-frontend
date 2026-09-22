import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import nodemailer from "nodemailer";
import { getEmailConfig } from "../config/email.js";

try {
  const config = getEmailConfig();
  setDefaultResultOrder("ipv4first");
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
  try {
    await transport.verify();
    console.log("SMTP connection and authentication succeeded.");
  } finally {
    transport.close();
  }
} catch (error) {
  console.error("Email configuration check failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
}
