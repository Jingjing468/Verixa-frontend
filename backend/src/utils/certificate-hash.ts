import { createHash } from "node:crypto";

export type CertificateHashData = {
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  organizationName: string;
  issueDate: string;
  expiryDate: string | null;
};

const normalizeString = (value: string): string => value.trim();

const normalizeDate = (value: string): string => value.trim();

const normalizeNullableDate = (value: string | null): string =>
  value === null ? "null" : normalizeDate(value);

export const canonicalizeCertificateForHash = (
  certificate: CertificateHashData
): string => {
  const fields: Array<[string, string]> = [
    ["certificateId", normalizeString(certificate.certificateId)],
    ["recipientName", normalizeString(certificate.recipientName)],
    ["recipientEmail", normalizeString(certificate.recipientEmail).toLowerCase()],
    ["courseName", normalizeString(certificate.courseName)],
    ["organizationName", normalizeString(certificate.organizationName)],
    ["issueDate", normalizeDate(certificate.issueDate)],
    ["expiryDate", normalizeNullableDate(certificate.expiryDate)],
  ];

  return fields.map(([key, value]) => `${key}=${JSON.stringify(value)}`).join("\n");
};

export const generateCertificateHash = (certificate: CertificateHashData): string =>
  createHash("sha256")
    .update(canonicalizeCertificateForHash(certificate), "utf8")
    .digest("hex");

export const isCertificateHash = (value: string): boolean =>
  /^[a-f0-9]{64}$/.test(value);

export const doesCertificateHashMatch = (
  certificate: CertificateHashData,
  storedHash: string | null
): boolean => storedHash === generateCertificateHash(certificate);
