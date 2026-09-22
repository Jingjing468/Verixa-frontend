import { parseCertificateDesign } from "./certificate-design.js";
import type { PoolClient } from "pg";
import { pool } from "../config/database.js";
import {
  createBlockchainRecord,
  findBlockchainRecordByCertificateId,
} from "../repositories/blockchain-record.repository.js";
import {
  countCertificatesByOrganization,
  createRevocationLog,
  createCertificate,
  findCertificatePdfDataByIdAndOrganization,
  findCertificateDetailByIdAndOrganization,
  findCertificateHashDataById,
  findCertificateStatusForUpdate,
  findCertificatesByOrganization,
  findRecipientSnapshotByOrganization,
  findRevocationsByCertificateAndOrganization,
  markCertificateRevoked,
  updateCertificateByIdAndOrganization,
  updateCertificateHash,
  updateCertificatePdfUrl,
  type CertificateDetailRecord,
  type CertificatePdfRecord,
  type CertificateRecord,
  type RevocationRecord,
} from "../repositories/certificate.repository.js";
import type {
  CertificateDetail,
  CertificateInput,
  CertificateRevocation,
  CertificateStatus,
  CertificateSummary,
} from "../types/certificate.js";
import { HttpError } from "../utils/http-error.js";
import { generateCertificateHash } from "../utils/certificate-hash.js";
import { getRequiredString, isRecord } from "../utils/validation.js";
import { createNotification } from "../repositories/support.repository.js";
import { createBlockchainService } from "./blockchain.service.js";
import {
  sendCertificateEmail,
  type CertificateEmailDeliveryResult,
} from "./certificate-email.service.js";
import {
  certificatePdfExists,
  generateCertificatePdf,
  getCertificatePdfFileName,
  getCertificatePdfPath,
  type CertificatePdfData,
} from "./certificate-artifact.service.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validStatuses = new Set<CertificateStatus>(["valid", "expired", "revoked"]);

const assertValidUuid = (value: string, resourceName: string): void => {
  if (!uuidPattern.test(value)) {
    throw new HttpError(404, `${resourceName} not found`);
  }
};

const isValidDateString = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const parseOptionalDate = (
  body: Record<string, unknown>,
  fieldName: string
): string | null => {
  const value = body[fieldName];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string" || !isValidDateString(value)) {
    throw new HttpError(400, `${fieldName} must be a valid YYYY-MM-DD date or null`);
  }

  return value;
};

const parseCertificateInput = (body: unknown): CertificateInput => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const recipientId = getRequiredString(body, "recipientId");
  const courseName = getRequiredString(body, "courseName");
  const issueDate = getRequiredString(body, "issueDate");
  const expiryDate = parseOptionalDate(body, "expiryDate");

  if (!uuidPattern.test(recipientId)) {
    throw new HttpError(400, "recipientId must be a valid UUID");
  }

  if (!isValidDateString(issueDate)) {
    throw new HttpError(400, "issueDate must be a valid YYYY-MM-DD date");
  }

  if (expiryDate && expiryDate < issueDate) {
    throw new HttpError(400, "expiryDate must be on or after issueDate");
  }

  return {
    recipientId,
    courseName,
    issueDate,
    expiryDate,
  };
};

const parseRevocationInput = (body: unknown): { reason: string; note: string | null } => {
  if (!isRecord(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }

  const reason = getRequiredString(body, "reason");
  const noteValue = body.note;

  if (noteValue === undefined || noteValue === null) {
    return { reason, note: null };
  }

  if (typeof noteValue !== "string") {
    throw new HttpError(400, "note must be a string or null");
  }

  const note = noteValue.trim();

  return {
    reason,
    note: note.length > 0 ? note : null,
  };
};

const toRevocation = (record: RevocationRecord): CertificateRevocation => ({
  reason: record.reason,
  note: record.note,
  revokedAt: record.revoked_at.toISOString(),
  revokedBy: {
    id: record.revoked_by_id,
    fullName: record.revoked_by_full_name,
  },
});

const toSummary = (record: CertificateRecord): CertificateSummary => ({
  id: record.id,
  certificateId: record.certificate_id,
  recipient: {
    id: record.recipient_id,
    fullName: record.recipient_name,
    email: record.recipient_email,
  },
  courseName: record.course_name,
  issueDate: record.issue_date,
  expiryDate: record.expiry_date,
  status: record.computed_status,
  createdAt: record.created_at.toISOString(),
  updatedAt: record.updated_at.toISOString(),
});

const toDetail = (record: CertificateDetailRecord): CertificateDetail => ({
  blockchain: null,
  ...toSummary(record),
  design: record.design,
  organization: {
    id: record.organization_id,
    name: record.organization_name,
    email: record.organization_email,
  },
  issuer: {
    id: record.issuer_id,
    fullName: record.issuer_full_name,
    email: record.issuer_email,
    role: record.issuer_role,
  },
  revocation:
    record.revocation_reason && record.revoked_at && record.revoked_by_id && record.revoked_by_full_name
      ? {
          reason: record.revocation_reason,
          note: record.revocation_note,
          revokedAt: record.revoked_at.toISOString(),
          revokedBy: {
            id: record.revoked_by_id,
            fullName: record.revoked_by_full_name,
          },
        }
      : null,
});

const parseStatusFilter = (status: unknown): CertificateStatus | null => {
  if (status === undefined) {
    return null;
  }

  if (typeof status !== "string" || !validStatuses.has(status as CertificateStatus)) {
    throw new HttpError(400, "status must be valid, expired, or revoked");
  }

  return status as CertificateStatus;
};

const parseSearchFilter = (search: unknown): string | null => {
  if (search === undefined) {
    return null;
  }

  if (typeof search !== "string") {
    throw new HttpError(400, "search must be a string");
  }

  return search.trim().length > 0 ? search.trim() : null;
};

const parsePositiveInteger = (
  value: unknown,
  fieldName: string,
  defaultValue: number,
  maxValue: number
): number => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new HttpError(400, `${fieldName} must be a positive integer`);
  }

  const parsedValue = Number.parseInt(value, 10);

  if (parsedValue < 1 || parsedValue > maxValue) {
    throw new HttpError(400, `${fieldName} must be between 1 and ${maxValue}`);
  }

  return parsedValue;
};

const regenerateCertificateHash = async (
  client: PoolClient,
  certificateId: string
): Promise<string> => {
  const hashData = await findCertificateHashDataById(client, certificateId);

  if (!hashData) {
    throw new Error("Certificate hash data not found");
  }

  const certificateHash = generateCertificateHash(hashData);

  await updateCertificateHash(client, certificateId, certificateHash);

  return certificateHash;
};

const toCertificatePdfData = (record: CertificatePdfRecord): CertificatePdfData => ({
  id: record.id,
  design: record.design,
  certificateId: record.certificate_id,
  recipientName: record.recipient_name,
  courseName: record.course_name,
  organizationName: record.organization_name,
  issueDate: record.issue_date,
  expiryDate: record.expiry_date,
});

const createNotificationSafely = async (input: Parameters<typeof createNotification>[0]) => {
  try {
    await createNotification(input);
  } catch (error: unknown) {
    console.error(
      "Notification creation failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

const isBlockchainIssuanceEnabled = (): boolean => process.env.BLOCKCHAIN_ENABLED === "true";

export const regenerateCertificatePdf = async (
  organizationId: string,
  id: string
): Promise<{ pdfUrl: string }> => {
  assertValidUuid(id, "Certificate");

  const certificate = await findCertificatePdfDataByIdAndOrganization(
    id,
    organizationId
  );

  if (!certificate) {
    throw new HttpError(404, "Certificate not found");
  }

  const generatedPdf = await generateCertificatePdf(toCertificatePdfData(certificate));

  await updateCertificatePdfUrl(id, organizationId, generatedPdf.pdfUrl);

  return {
    pdfUrl: generatedPdf.pdfUrl,
  };
};

export const getCertificatePdfDownload = async (
  organizationId: string,
  id: string
): Promise<{ filePath: string; fileName: string }> => {
  assertValidUuid(id, "Certificate");

  const certificate = await findCertificatePdfDataByIdAndOrganization(
    id,
    organizationId
  );

  if (!certificate) {
    throw new HttpError(404, "Certificate not found");
  }

  const exists = await certificatePdfExists(certificate.certificate_id);

  if (!exists) {
    const generatedPdf = await generateCertificatePdf(toCertificatePdfData(certificate));
    await updateCertificatePdfUrl(id, organizationId, generatedPdf.pdfUrl);
  }

  return {
    filePath: getCertificatePdfPath(certificate.certificate_id),
    fileName: getCertificatePdfFileName(certificate.certificate_id),
  };
};

export const addCertificate = async (
  organizationId: string,
  issuedBy: string,
  body: unknown
): Promise<{
  success: true;
  certificate: CertificateSummary;
  emailDelivery: CertificateEmailDeliveryResult | null;
  warnings: string[];
}> => {
  const input = parseCertificateInput(body);
  const design = parseCertificateDesign(isRecord(body) ? body.design : undefined);
  const client = await pool.connect();
  let createdCertificate: CertificateRecord | null = null;
  let createdCertificateHash: string | null = null;

  try {
    await client.query("BEGIN");

    const recipient = await findRecipientSnapshotByOrganization(
      client,
      input.recipientId,
      organizationId
    );

    if (!recipient) {
      throw new HttpError(404, "Recipient not found");
    }

    const certificate = await createCertificate(
      client,
      organizationId,
      issuedBy,
      { ...recipient, full_name: design.recipientName?.trim() || recipient.full_name },
      input.courseName,
      input.issueDate,
      input.expiryDate
    );

    await client.query("UPDATE certificates SET design = $1 WHERE id = $2", [JSON.stringify(design), certificate.id]);
    const certificateHash = await regenerateCertificateHash(client, certificate.id);

    await client.query("COMMIT");

    createdCertificate = certificate;
    createdCertificateHash = certificateHash;
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const warnings: string[] = [];
  try {
    if (isBlockchainIssuanceEnabled()) {
      const blockchainResult = await createBlockchainService().issueCertificateOnChain(
        createdCertificate.certificate_id,
        createdCertificateHash
      );

      await createBlockchainRecord({
        certificateDatabaseId: createdCertificate.id,
        network: blockchainResult.network,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        contractAddress: blockchainResult.contractAddress,
        certificateHash: createdCertificateHash,
      });
    } else {
      warnings.push("Certificate created without blockchain anchoring.");
    }
    await regenerateCertificatePdf(organizationId, createdCertificate.id);
    await createNotificationSafely({
      organizationId,
      userId: issuedBy,
      type: "certificate_issued",
      title: "Certificate issued",
      message: `Certificate ${createdCertificate.certificate_id} was issued to ${createdCertificate.recipient_name}.`,
    });
  } catch (error: unknown) {
    throw new HttpError(
      502,
      `Certificate was saved, but PDF generation failed: ${
        error instanceof Error ? error.message : "Unknown PDF error"
      }`
    );
  }

  let emailDelivery: CertificateEmailDeliveryResult | null = null;

  try {
    emailDelivery = await sendCertificateEmail(
      organizationId,
      createdCertificate.id,
      "certificate_issued"
    );
  } catch (error: unknown) {
    emailDelivery = {
      success: false,
      status: "failed",
      message:
        error instanceof Error
          ? `Certificate email delivery failed: ${error.message}`
          : "Certificate email delivery failed",
      log: {
        recipientEmail: createdCertificate.recipient_email,
        emailType: "certificate_issued",
        status: "failed",
        errorMessage: "Certificate email delivery failed before SMTP attempt",
        sentAt: null,
        createdAt: new Date().toISOString(),
      },
    };
  }

  if (emailDelivery && !emailDelivery.success) {
    warnings.push("Certificate created, but the delivery email was not sent. Configure email and resend from the certificate page.");
  }

  return {
    success: true,
    certificate: toSummary(createdCertificate),
    emailDelivery,
    warnings,
  };
};

export const revokeCertificate = async (
  organizationId: string,
  revokedBy: string,
  id: string,
  body: unknown
): Promise<{ success: true; certificate: CertificateSummary; revocation: CertificateRevocation }> => {
  assertValidUuid(id, "Certificate");

  const input = parseRevocationInput(body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentCertificate = await findCertificateStatusForUpdate(
      client,
      id,
      organizationId
    );

    if (!currentCertificate) {
      throw new HttpError(404, "Certificate not found");
    }

    if (currentCertificate.status === "revoked") {
      throw new HttpError(409, "Certificate is already revoked");
    }

    const blockchainRecord = await findBlockchainRecordByCertificateId(id);

    if (blockchainRecord) {
      try {
        await createBlockchainService().revokeCertificateOnChain(
          currentCertificate.certificate_id
        );
      } catch (error: unknown) {
        throw new HttpError(
          502,
          `Blockchain revocation failed; database revocation was not saved: ${
            error instanceof Error ? error.message : "Unknown blockchain error"
          }`
        );
      }
    }

    const revocation = await createRevocationLog(
      client,
      id,
      revokedBy,
      input.reason,
      input.note
    );
    const certificate = await markCertificateRevoked(client, id, organizationId);

    await client.query("COMMIT");
    await createNotificationSafely({
      organizationId,
      userId: revokedBy,
      type: "certificate_revoked",
      title: "Certificate revoked",
      message: `Certificate ${currentCertificate.certificate_id} was revoked.`,
    });

    return {
      success: true,
      certificate: toSummary(certificate),
      revocation: toRevocation(revocation),
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const listCertificateRevocations = async (
  organizationId: string,
  id: string
): Promise<{ success: true; revocations: CertificateRevocation[] }> => {
  assertValidUuid(id, "Certificate");

  const revocations = await findRevocationsByCertificateAndOrganization(
    id,
    organizationId
  );

  if (!revocations) {
    throw new HttpError(404, "Certificate not found");
  }

  return {
    success: true,
    revocations: revocations.map(toRevocation),
  };
};

export const listCertificates = async (
  organizationId: string,
  query: Record<string, unknown>
): Promise<{
  success: true;
  data: CertificateSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const status = parseStatusFilter(query.status);
  const search = parseSearchFilter(query.search);
  const page = parsePositiveInteger(query.page, "page", 1, 100000);
  const limit = parsePositiveInteger(query.limit, "limit", 10, 100);
  const offset = (page - 1) * limit;

  const [total, certificates] = await Promise.all([
    countCertificatesByOrganization(organizationId, { status, search }),
    findCertificatesByOrganization(organizationId, {
      status,
      search,
      limit,
      offset,
    }),
  ]);

  return {
    success: true,
    data: certificates.map(toSummary),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCertificate = async (
  organizationId: string,
  id: string
): Promise<{ success: true; certificate: CertificateDetail }> => {
  assertValidUuid(id, "Certificate");

  const certificate = await findCertificateDetailByIdAndOrganization(id, organizationId);

  if (!certificate) {
    throw new HttpError(404, "Certificate not found");
  }

  return {
    success: true,
    certificate: { ...toDetail(certificate), blockchain: await (async () => {
      const record = await findBlockchainRecordByCertificateId(id);
      return record ? { network: record.network, transactionHash: record.transaction_hash, blockNumber: Number(record.block_number ?? 0), certificateHash: record.certificate_hash } : null;
    })() },
  };
};

export const updateCertificate = async (
  organizationId: string,
  id: string,
  body: unknown
): Promise<{ success: true; certificate: CertificateSummary }> => {
  assertValidUuid(id, "Certificate");

  const input = parseCertificateInput(body);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currentCertificate = await findCertificateStatusForUpdate(
      client,
      id,
      organizationId
    );

    if (!currentCertificate) {
      throw new HttpError(404, "Certificate not found");
    }

    if (currentCertificate.status === "revoked") {
      throw new HttpError(409, "Revoked certificates cannot be edited");
    }

    const blockchainRecord = await findBlockchainRecordByCertificateId(id);

    if (blockchainRecord) {
      throw new HttpError(409, "Blockchain-anchored certificates cannot be edited");
    }

    const recipient = await findRecipientSnapshotByOrganization(
      client,
      input.recipientId,
      organizationId
    );

    if (!recipient) {
      throw new HttpError(404, "Recipient not found");
    }

    const certificate = await updateCertificateByIdAndOrganization(
      client,
      id,
      organizationId,
      recipient,
      input.courseName,
      input.issueDate,
      input.expiryDate
    );

    if (!certificate) {
      throw new HttpError(404, "Certificate not found");
    }

    await regenerateCertificateHash(client, certificate.id);

    await client.query("COMMIT");

    return {
      success: true,
      certificate: toSummary(certificate),
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
