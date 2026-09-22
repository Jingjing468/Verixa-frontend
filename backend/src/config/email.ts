export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const defaultSmtpHost = "smtp.gmail.com";
const defaultSmtpPort = 587;
const defaultSmtpSecure = false;

const parseSmtpPort = (value: string | undefined, fallback = defaultSmtpPort): number => {
  if (!value) return fallback;

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port number");
  }

  return port;
};

const parseSmtpSecure = (
  value: string | undefined,
  fallback = defaultSmtpSecure
): boolean => {
  if (!value) return fallback;

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error("SMTP_SECURE must be true or false");
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

const normalizeSmtpPassword = (host: string, pass: string): string =>
  host === defaultSmtpHost ? pass.replace(/\s+/g, "") : pass;

export const getEmailConfig = (): EmailConfig => ({
  host: (process.env.SMTP_HOST ?? defaultSmtpHost).trim(),
  port: parseSmtpPort(process.env.SMTP_PORT),
  secure: parseSmtpSecure(process.env.SMTP_SECURE),
  user: getRequiredEnv("SMTP_USER"),
  pass: normalizeSmtpPassword(
    (process.env.SMTP_HOST ?? defaultSmtpHost).trim(),
    getRequiredEnv("SMTP_PASS")
  ),
  from: process.env.EMAIL_FROM ?? `Verixa <${getRequiredEnv("SMTP_USER")}>`,
});
