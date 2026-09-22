import assert from "node:assert/strict";
import test from "node:test";
import type { EmailLogRecord } from "../repositories/email-log.repository.js";
import {
  sendCertificateEmailAttempt,
  type SendableCertificateEmailData,
} from "./certificate-email.service.js";
import type { EmailTransporter } from "./email.service.js";

process.env.PUBLIC_FRONTEND_URL = "http://localhost:5173";

const certificate: SendableCertificateEmailData = {
  id: "11111111-1111-4111-8111-111111111111",
  certificateId: "CERT-2099-0000003",
  recipientName: "Log Test Student",
  recipientEmail: "log.student@example.com",
  organizationName: "Verixa Test Organization",
  courseName: "Email Log Testing",
  status: "valid",
  pdfPath: "C:/tmp/certificate.pdf",
};

const createLogFactory = (logs: EmailLogRecord[]) => async (input: {
  certificateId: string;
  recipientEmail: string;
  emailType: "certificate_issued" | "certificate_resent" | "revocation_notice";
  status: "sent" | "failed";
  errorMessage: string | null;
  sentAt: Date | null;
}): Promise<EmailLogRecord> => {
  const log: EmailLogRecord = {
    id: `${logs.length + 1}`,
    certificate_id: input.certificateId,
    recipient_email: input.recipientEmail,
    email_type: input.emailType,
    status: input.status,
    error_message: input.errorMessage,
    sent_at: input.sentAt,
    created_at: new Date("2099-01-01T00:00:00.000Z"),
  };

  logs.push(log);

  return log;
};

test("successful email delivery creates a sent email log", async () => {
  const logs: EmailLogRecord[] = [];
  const transporter: EmailTransporter = {
    sendMail: async () => ({ messageId: "sent-message" }),
  };

  const result = await sendCertificateEmailAttempt(
    certificate,
    "certificate_issued",
    createLogFactory(logs),
    transporter
  );

  assert.equal(result.success, true);
  assert.equal(result.status, "sent");
  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.status, "sent");
  assert.equal(logs[0]?.sent_at instanceof Date, true);
});

test("failed email delivery creates a failed email log", async () => {
  const logs: EmailLogRecord[] = [];
  const transporter: EmailTransporter = {
    sendMail: async () => {
      throw new Error("SMTP unavailable");
    },
  };

  const result = await sendCertificateEmailAttempt(
    certificate,
    "certificate_issued",
    createLogFactory(logs),
    transporter
  );

  assert.equal(result.success, false);
  assert.equal(result.status, "failed");
  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.status, "failed");
  assert.equal(
    logs[0]?.error_message,
    "Certificate email delivery failed: SMTP unavailable"
  );
  assert.equal(result.message, "Certificate email delivery failed: SMTP unavailable");
});

test("resend delivery only creates a certificate_resent email log", async () => {
  const logs: EmailLogRecord[] = [];
  const transporter: EmailTransporter = {
    sendMail: async () => ({ messageId: "resent-message" }),
  };

  const result = await sendCertificateEmailAttempt(
    certificate,
    "certificate_resent",
    createLogFactory(logs),
    transporter
  );

  assert.equal(result.success, true);
  assert.equal(logs.length, 1);
  assert.equal(logs[0]?.email_type, "certificate_resent");
});
