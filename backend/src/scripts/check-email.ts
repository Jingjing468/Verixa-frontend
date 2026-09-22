import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import nodemailer from "nodemailer";
import { getEmailConfig } from "../config/email.js";
import { createResendTransporter, getResendApiKey } from "../config/resend-adapter.js";

const checkResend = async (apiKey: string): Promise<void> => {
  const transporter = createResendTransporter(apiKey);

  console.log("Sending a Resend test email via the HTTPS API...");

  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "Verixa <onboarding@resend.dev>",
    to: process.env.SMTP_USER ?? "delivered@resend.dev",
    subject: "Verixa email configuration check (Resend)",
    text: "If you receive this, Resend email delivery is configured correctly.",
  });

  console.log(`Resend accepted the message (id: ${result.messageId}).`);
  console.log(
    "Note: on the free plan without a verified domain, Resend can only deliver to your own account email."
  );
};

const checkSmtp = async (): Promise<void> => {
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
};

try {
  const resendApiKey = getResendApiKey();

  if (resendApiKey) {
    await checkResend(resendApiKey);
  } else {
    await checkSmtp();
  }
} catch (error) {
  console.error(
    "Email configuration check failed:",
    error instanceof Error ? error.message : "Unknown error"
  );
  process.exitCode = 1;
}
