import assert from "node:assert/strict";
import test from "node:test";
import type { SendMailOptions } from "nodemailer";
import {
  sendCertificateDeliveryEmail,
  sendPasswordResetEmail,
  type CertificateDeliveryEmail,
  type EmailTransporter,
} from "./email.service.js";

process.env.PUBLIC_FRONTEND_URL = "http://localhost:5173";

test("password reset email addresses Gmail recipient and includes an encoded reset link", async () => {
  let mail: SendMailOptions | undefined;
  await sendPasswordResetEmail(
    { recipientEmail: "recipient@gmail.com", resetToken: "test+token&value" },
    { sendMail: async (message) => { mail = message; return { messageId: "reset-test" }; } },
    { from: "Verixa <sender@gmail.com>" }
  );
  assert.equal(mail?.to, "recipient@gmail.com");
  assert.equal(mail?.from, "Verixa <sender@gmail.com>");
  assert.equal(mail?.subject, "Reset your Verixa password");
  assert.ok(String(mail?.text).includes("http://localhost:5173/reset-password?token=test%2Btoken%26value"));
  assert.ok(String(mail?.html).includes("This link expires in 1 hour"));
});

test("password reset email propagates SMTP delivery failures", async () => {
  await assert.rejects(sendPasswordResetEmail(
    { recipientEmail: "recipient@gmail.com", resetToken: "test-token" },
    { sendMail: async () => { throw new Error("SMTP authentication failed"); } },
    { from: "sender@gmail.com" }
  ), /SMTP authentication failed/);
});

const email: CertificateDeliveryEmail = {
  recipientName: "Email Test Student",
  recipientEmail: "student@example.com",
  organizationName: "Verixa Test Organization",
  courseName: "Email Delivery Testing",
  certificateId: "CERT-2099-0000002",
  certificateStatus: "valid",
  pdfPath: "C:/tmp/certificate.pdf",
};

test("certificate delivery email uses mocked transporter and includes attachment", async () => {
  let capturedMail: unknown = null;
  const transporter: EmailTransporter = {
    sendMail: async (mail) => {
      capturedMail = mail;
      return { messageId: "mock-message-id" };
    },
  };

  const result = await sendCertificateDeliveryEmail(email, transporter, {
    from: "Verixa <no-reply@example.com>",
  });

  assert.equal(result.messageId, "mock-message-id");

  if (capturedMail === null) {
    assert.fail("Expected email to be captured by mocked transporter");
  }

  const mail = capturedMail as SendMailOptions;
  const attachments = mail.attachments as Array<{ path?: string }> | undefined;

  assert.equal(mail.to, email.recipientEmail);
  assert.equal(mail.subject?.includes(email.certificateId), true);
  assert.equal(
    typeof mail.text === "string" && mail.text.includes("/verify/CERT-2099-0000002"),
    true
  );
  assert.equal(attachments?.[0]?.path, email.pdfPath);
});
