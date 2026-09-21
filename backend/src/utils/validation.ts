import { HttpError } from "./http-error.js";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const getRequiredString = (
  body: Record<string, unknown>,
  fieldName: string
): string => {
  const value = body[fieldName];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value.trim();
};

export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
