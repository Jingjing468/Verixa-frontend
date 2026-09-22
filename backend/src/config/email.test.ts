import assert from "node:assert/strict";
import test from "node:test";
import { getEmailConfig, normalizeEmailFrom } from "./email.js";

const previousEnv = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
};

test.after(() => {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

test("Gmail SMTP credentials are trimmed and app-password spaces are ignored", () => {
  process.env.SMTP_HOST = " smtp.gmail.com ";
  process.env.SMTP_USER = " sender@gmail.com ";
  process.env.SMTP_PASS = " abcd efgh ijkl mnop ";
  delete process.env.EMAIL_FROM;

  const config = getEmailConfig();

  assert.equal(config.host, "smtp.gmail.com");
  assert.equal(config.user, "sender@gmail.com");
  assert.equal(config.pass, "abcdefghijklmnop");
  assert.equal(config.from, "Verixa <sender@gmail.com>");
});

test("normalizeEmailFrom repairs a From value missing its closing angle bracket", () => {
  assert.equal(
    normalizeEmailFrom('"Verixa <sender@gmail.com', "fallback@gmail.com"),
    "Verixa <sender@gmail.com>"
  );
});

test("normalizeEmailFrom keeps a well-formed From value unchanged", () => {
  assert.equal(
    normalizeEmailFrom("Verixa <sender@gmail.com>", "fallback@gmail.com"),
    "Verixa <sender@gmail.com>"
  );
});

test("normalizeEmailFrom accepts a bare address and repairs a display-name-only value", () => {
  assert.equal(normalizeEmailFrom("sender@gmail.com", "fallback@gmail.com"), "sender@gmail.com");
  assert.equal(normalizeEmailFrom('"Verixa', "fallback@gmail.com"), "Verixa <fallback@gmail.com>");
});
