import { readFileSync } from "node:fs";
import { Resend } from "resend";
import type { SendMailOptions } from "nodemailer";

/**
 * Minimal Nodemailer-compatible adapter over the Resend HTTPS API.
 *
 * Render's free tier blocks outbound SMTP ports (25/465/587), so Gmail SMTP
 * always fails there with a connection timeout. Resend sends over HTTPS
 * (port 443), which is allowed. This adapter implements just enough of the
 * `sendMail` contract used by this codebase so callers don't need to change.
 */

export type ResendAttachment = {
  filename?: string;
  content?: string;
  path?: string;
  contentType?: string;
};

export type ResendClient = {
  emails: {
    send: (payload: {
      from: string;
      to: string[];
      subject: string;
      html?: string;
      text?: string;
      attachments?: Array<{ filename: string; content: string }>;
    }) => Promise<{ data: { id: string } | null; error: { message: string } | null }>;
  };
};

export const getResendApiKey = (): string | null => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  return apiKey ? apiKey : null;
};

export const createResendTransporter = (
  apiKey: string,
  client?: ResendClient
): { sendMail: (mail: SendMailOptions) => Promise<{ messageId: string }> } => {
  const resend: ResendClient = client ?? (new Resend(apiKey) as unknown as ResendClient);

  const readFileOrThrow = (attachment: ResendAttachment): { filename: string; content: string } => {
    const fileName = attachment.filename ?? "attachment";

    if (typeof attachment.content === "string" && attachment.content.length > 0) {
      return { filename: fileName, content: attachment.content };
    }

    if (typeof attachment.path === "string" && attachment.path.length > 0) {
      const buffer = readFileSync(attachment.path);

      return { filename: fileName, content: buffer.toString("base64") };
    }

    throw new Error(`Attachment for "${fileName}" has no readable content or path`);
  };

  return {
    sendMail: async (mail: SendMailOptions) => {
      const to = Array.isArray(mail.to) ? mail.to : mail.to ? [mail.to] : [];

      if (to.length === 0) {
        throw new Error("Resend email requires at least one recipient");
      }

      if (typeof mail.from !== "string" || mail.from.trim().length === 0) {
        throw new Error("Resend email requires a from address");
      }

      const attachments = Array.isArray(mail.attachments)
        ? (mail.attachments as ResendAttachment[]).map(readFileOrThrow)
        : [];

      const { data, error } = await resend.emails.send({
        from: mail.from,
        to: to.map(String),
        subject: typeof mail.subject === "string" ? mail.subject : "",
        text: typeof mail.text === "string" ? mail.text : undefined,
        html: typeof mail.html === "string" ? mail.html : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (error) {
        throw new Error(`Resend delivery failed: ${error.message}`);
      }

      return { messageId: data?.id ?? "" };
    },
  };
};
