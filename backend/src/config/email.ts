export type EmailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const parseSmtpPort = (value: string | undefined): number => {
  if (!value) {
    throw new Error("SMTP_PORT environment variable is required");
  }

  const port = Number.parseInt(value, 10);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port number");
  }

  return port;
};

const parseSmtpSecure = (value: string | undefined): boolean => {
  if (!value) {
    throw new Error("SMTP_SECURE environment variable is required");
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error("SMTP_SECURE must be true or false");
};

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
};

export const getEmailConfig = (): EmailConfig => ({
  host: getRequiredEnv("SMTP_HOST"),
  port: parseSmtpPort(process.env.SMTP_PORT),
  secure: parseSmtpSecure(process.env.SMTP_SECURE),
  user: getRequiredEnv("SMTP_USER"),
  pass: getRequiredEnv("SMTP_PASS"),
  from: getRequiredEnv("EMAIL_FROM"),
});
