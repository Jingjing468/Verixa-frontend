import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { SendMailOptions } from "nodemailer";
import { createResendTransporter, getResendApiKey, type ResendClient } from "./resend-adapter.js";

test("getResendApiKey returns null when unset or blank", () => {
  const previous = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  assert.equal(getResendApiKey(), null);

  process.env.RESEND_API_KEY = "   ";
  assert.equal(getResendApiKey(), null);

  if (previous === undefined) {
    delete process.env.RESEND_API_KEY;
  } else {
    process.env.RESEND_API_KEY = previous;
  }
});

test("resend transporter sends text and html over the API and returns the message id", async () => {
  let captured: Record<string, unknown> | null = null;

  const client: ResendClient = {
    emails: {
      send: async (payload) => {
        captured = payload;
        return { data: { id: "resend-id-1" }, error: null };
      },
    },
  };

  const transporter = createResendTransporter("re_test_key", client);

  const result = await transporter.sendMail({
    from: "Verixa <onboarding@resend.dev>",
    to: "recipient@example.com",
    subject: "Hello",
    text: "plain",
    html: "<p>rich</p>",
  } satisfies SendMailOptions);

  assert.equal(result.messageId, "resend-id-1");
  assert.ok(captured);
  assert.equal((captured as Record<string, unknown>).from, "Verixa <onboarding@resend.dev>");
  assert.deepEqual((captured as Record<string, unknown>).to, ["recipient@example.com"]);
});

test("resend transporter attaches a local PDF file as base64 content", async () => {
  let captured: Record<string, unknown> | null = null;

  const client: ResendClient = {
    emails: {
      send: async (payload) => {
        captured = payload;
        return { data: { id: "resend-id-2" }, error: null };
      },
    },
  };

  const transporter = createResendTransporter("re_test_key", client);
  const pdfPath = fileURLToPath(new URL("../../package.json", import.meta.url));

  await transporter.sendMail({
    from: "Verixa <onboarding@resend.dev>",
    to: "recipient@example.com",
    subject: "Certificate",
    text: "attached",
    attachments: [{ filename: "certificate.pdf", path: pdfPath }],
  } satisfies SendMailOptions);

  assert.ok(captured);
  const attachments = (captured as Record<string, unknown>).attachments as Array<{
    filename: string;
    content: string;
  }>;


  assert.equal(attachments[0]?.filename, "certificate.pdf");
  assert.ok(attachments[0]?.content.length > 0);
});

test("resend transporter surfaces API errors as delivery failures", async () => {
  const client: ResendClient = {
    emails: {
      send: async () => ({ data: null, error: { message: "Invalid from address" } }),
    },
  };

  const transporter = createResendTransporter("re_test_key", client);

  await assert.rejects(
    transporter.sendMail({
      from: "not-allowed@example.com",
      to: "recipient@example.com",
      subject: "Hello",
      text: "plain",
    } satisfies SendMailOptions),
    /Resend delivery failed: Invalid from address/
  );
});
