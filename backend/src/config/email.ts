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

/**
 * Repairs a malformed EMAIL_FROM value so a bad From header can never break
 * email delivery. Common failure modes handled here:
 *  - surrounding quotes left in the value ("Verixa <me@gmail.com" style)
 *  - a display name without an address ("Verixa" or '"Verixa')
 *  - a missing closing angle bracket ("Verixa <me@gmail.com")
 */
export const normalizeEmailFrom = (from: string, fallbackAddress: string): string => {
  const unquoted = from.trim().replace(/^["'](.*)["']$/, "$1").trim();

  if (!unquoted) {
    return `Verixa <${fallbackAddress}>`;
  }

  const openIndex = unquoted.indexOf("<");
  const closeIndex = unquoted.lastIndexOf(">");

  if (openIndex !== -1) {
    // Use everything after '<' (dropping a stray '>' if present) as the address.
    const rawAddress = unquoted.slice(openIndex + 1).replace(/>/g, "").trim();

    if (rawAddress.includes("@")) {
      const displayName = unquoted
        .slice(0, openIndex)
        .replace(/["']/g, "")
        .trim();

      return displayName ? `${displayName} <${rawAddress}>` : rawAddress;
    }

    // '<' without an address after it: treat the whole value as a display name.
    const displayName = unquoted.replace(/[<>]/g, "").replace(/["']/g, "").trim();

    return displayName ? `${displayName} <${fallbackAddress}>` : `Verixa <${fallbackAddress}>`;
  }

  // No angle brackets at all: value is either a bare address or a display name only.
  if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(unquoted)) {
    return unquoted;
  }

  return `Verixa <${fallbackAddress}>`;
};

export const getEmailConfig = (): EmailConfig => ({
  host: (process.env.SMTP_HOST ?? defaultSmtpHost).trim(),
  port: parseSmtpPort(process.env.SMTP_PORT),
  secure: parseSmtpSecure(process.env.SMTP_SECURE),
  user: getRequiredEnv("SMTP_USER"),
  pass: normalizeSmtpPassword(
    (process.env.SMTP_HOST ?? defaultSmtpHost).trim(),
    getRequiredEnv("SMTP_PASS")
  ),
  from: normalizeEmailFrom(
    process.env.EMAIL_FROM ?? `Verixa <${getRequiredEnv("SMTP_USER")}>`,
    getRequiredEnv("SMTP_USER")
  ),
});
