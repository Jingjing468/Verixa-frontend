import nodemailer, { type SendMailOptions } from "nodemailer";
import { getEmailConfig, type EmailConfig } from "../config/email.js";
import { getPublicFrontendUrl } from "../config/public-url.js";
import { buildVerificationUrl } from "./certificate-artifact.service.js";

export type CertificateDeliveryEmail = {
  recipientName: string;
  recipientEmail: string;
  organizationName: string;
  courseName: string;
  certificateId: string;
  certificateStatus: string;
  pdfPath: string;
};

export type EmailSendResult = {
  messageId: string;
};

export type EmailTransporter = {
  sendMail(mail: SendMailOptions): Promise<{ messageId?: string }>;
};

export type PasswordResetEmail = {
  recipientEmail: string;
  resetToken: string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const createEmailTransporter = (
  config: EmailConfig = getEmailConfig()
): EmailTransporter =>
  nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: !config.secure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

export const sendCertificateDeliveryEmail = async (
  email: CertificateDeliveryEmail,
  transporter: EmailTransporter = createEmailTransporter(),
  config?: Pick<EmailConfig, "from">
): Promise<EmailSendResult> => {
  const emailConfig = config ?? {
    from: process.env.EMAIL_FROM ?? "Verixa <no-reply@example.com>",
  };
  const verificationUrl = buildVerificationUrl(email.certificateId);
  const safeRecipientName = escapeHtml(email.recipientName);
  const safeOrganizationName = escapeHtml(email.organizationName);
  const safeCourseName = escapeHtml(email.courseName);
  const safeCertificateId = escapeHtml(email.certificateId);
  const safeStatus = escapeHtml(email.certificateStatus);

  const result = await transporter.sendMail({
    from: emailConfig.from,
    to: email.recipientEmail,
    subject: `Your Verixa certificate ${email.certificateId}`,
    text: [
      `Hello ${email.recipientName},`,
      "",
      `${email.organizationName} has issued your certificate for ${email.courseName}.`,
      `Certificate ID: ${email.certificateId}`,
      `Status: ${email.certificateStatus}`,
      `Verify it here: ${verificationUrl}`,
      "",
      "Your certificate PDF is attached.",
      "",
      "Verixa",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #2563eb;">Your Verixa certificate is ready</h2>
        <p>Hello ${safeRecipientName},</p>
        <p><strong>${safeOrganizationName}</strong> has issued your certificate for:</p>
        <p style="font-size: 18px;"><strong>${safeCourseName}</strong></p>
        <p>Certificate ID: <strong>${safeCertificateId}</strong></p>
        <p>Status: <strong>${safeStatus}</strong></p>
        <p>You can verify this certificate publicly at:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Your certificate PDF is attached.</p>
        <p style="color: #5b6472;">Verixa digital certificate verification</p>
      </div>
    `,
    attachments: [
      {
        filename: `${email.certificateId}.pdf`,
        path: email.pdfPath,
        contentType: "application/pdf",
      },
    ],
  });

  return {
    messageId: result.messageId ?? "",
  };
};

export const sendPasswordResetEmail = async (
  email: PasswordResetEmail,
  transporter: EmailTransporter = createEmailTransporter(),
  config?: Pick<EmailConfig, "from">
): Promise<EmailSendResult> => {
  const emailConfig = config ?? {
    from: process.env.EMAIL_FROM ?? "Verixa <no-reply@example.com>",
  };
  const resetUrl = `${getPublicFrontendUrl()}/reset-password?token=${encodeURIComponent(
    email.resetToken
  )}`;

  const result = await transporter.sendMail({
    from: emailConfig.from,
    to: email.recipientEmail,
    subject: "Reset your Verixa password",
    text: [
      "We received a request to reset your Verixa password.",
      "",
      `Reset your password here: ${resetUrl}`,
      "",
      "This link expires in 1 hour. If you did not request this, you can ignore this email.",
      "",
      "Verixa",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="color: #2563eb;">Reset your Verixa password</h2>
        <p>We received a request to reset your Verixa password.</p>
        <p><a href="${resetUrl}">Reset your password</a></p>
        <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
        <p style="color: #5b6472;">Verixa account security</p>
      </div>
    `,
  });

  return {
    messageId: result.messageId ?? "",
  };
};
