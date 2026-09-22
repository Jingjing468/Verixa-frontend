import {
  createEmailLog,
  findEmailLogsByCertificateAndOrganization,
  type EmailLogRecord,
  type EmailType,
} from "../repositories/email-log.repository.js";
import {
  findCertificateEmailDataByIdAndOrganization,
  updateCertificatePdfUrl,
  type CertificateEmailRecord,
} from "../repositories/certificate.repository.js";
import { HttpError } from "../utils/http-error.js";
import {
  certificatePdfExists,
  generateCertificatePdf,
  getCertificatePdfPath,
} from "./certificate-artifact.service.js";
import {
  sendCertificateDeliveryEmail,
  type EmailTransporter,
} from "./email.service.js";
import { createNotification } from "../repositories/support.repository.js";
import { getEmailConfig } from "../config/email.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type SafeEmailLog = {
  recipientEmail: string;
  emailType: EmailType;
  status: "sent" | "failed";
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type CertificateEmailDeliveryResult = {
  success: boolean;
  status: "sent" | "failed";
  message: string;
  log: SafeEmailLog;
};

export type SendableCertificateEmailData = {
  id: string;
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  organizationName: string;
  courseName: string;
  status: string;
  pdfPath: string;
};

type CreateEmailLogFn = typeof createEmailLog;

const assertValidUuid = (value: string): void => {
  if (!uuidPattern.test(value)) {
    throw new HttpError(404, "Certificate not found");
  }
};

const toSafeEmailLog = (log: EmailLogRecord): SafeEmailLog => ({
  recipientEmail: log.recipient_email,
  emailType: log.email_type,
  status: log.status,
  errorMessage: log.error_message,
  sentAt: log.sent_at ? log.sent_at.toISOString() : null,
  createdAt: log.created_at.toISOString(),
});

const getEmailDeliveryErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message.trim().length > 0
    ? `Certificate email delivery failed: ${error.message}`
    : "Certificate email delivery failed";

const getSendableCertificate = async (
  organizationId: string,
  certificateId: string
): Promise<CertificateEmailRecord> => {
  assertValidUuid(certificateId);

  const certificate = await findCertificateEmailDataByIdAndOrganization(
    certificateId,
    organizationId
  );

  if (!certificate) {
    throw new HttpError(404, "Certificate not found");
  }

  if (certificate.status === "revoked") {
    throw new HttpError(409, "Revoked certificates cannot be sent as issued certificates");
  }

  const pdfExists = await certificatePdfExists(certificate.certificate_id);

  if (!pdfExists) {
    const generatedPdf = await generateCertificatePdf({
      id: certificate.id,
      design: certificate.design,
      certificateId: certificate.certificate_id,
      recipientName: certificate.recipient_name,
      courseName: certificate.course_name,
      organizationName: certificate.organization_name,
      issueDate: certificate.issue_date,
      expiryDate: certificate.expiry_date,
    });

    await updateCertificatePdfUrl(certificate.id, organizationId, generatedPdf.pdfUrl);
  }

  return certificate;
};

export const sendCertificateEmailAttempt = async (
  certificate: SendableCertificateEmailData,
  emailType: Extract<EmailType, "certificate_issued" | "certificate_resent">,
  createLog: CreateEmailLogFn = createEmailLog,
  transporter?: EmailTransporter
): Promise<CertificateEmailDeliveryResult> => {
  try {
    await sendCertificateDeliveryEmail(
      {
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        organizationName: certificate.organizationName,
        courseName: certificate.courseName,
        certificateId: certificate.certificateId,
        certificateStatus: certificate.status,
        pdfPath: certificate.pdfPath,
      },
      transporter
    );

    const log = await createLog({
      certificateId: certificate.id,
      recipientEmail: certificate.recipientEmail,
      emailType,
      status: "sent",
      errorMessage: null,
      sentAt: new Date(),
    });

    return {
      success: true,
      status: "sent",
      message: "Certificate email sent successfully",
      log: toSafeEmailLog(log),
    };
  } catch (error: unknown) {
    const errorMessage = getEmailDeliveryErrorMessage(error);
    const log = await createLog({
      certificateId: certificate.id,
      recipientEmail: certificate.recipientEmail,
      emailType,
      status: "failed",
      errorMessage,
      sentAt: null,
    });

    return {
      success: false,
      status: "failed",
      message: errorMessage,
      log: toSafeEmailLog(log),
    };
  }
};

export const sendCertificateEmail = async (
  organizationId: string,
  certificateId: string,
  emailType: Extract<EmailType, "certificate_issued" | "certificate_resent">,
  transporter?: EmailTransporter
): Promise<CertificateEmailDeliveryResult> => {
  const certificate = await getSendableCertificate(organizationId, certificateId);
  if (!transporter) {
    try {
      getEmailConfig();
    } catch {
      throw new HttpError(503, "Email sending is not configured. Ask your administrator to configure the Gmail sender and App Password.");
    }
  }

  const delivery = await sendCertificateEmailAttempt(
    {
      id: certificate.id,
      certificateId: certificate.certificate_id,
      recipientName: certificate.recipient_name,
      recipientEmail: certificate.recipient_email,
      organizationName: certificate.organization_name,
      courseName: certificate.course_name,
      status: certificate.status,
      pdfPath: getCertificatePdfPath(certificate.certificate_id),
    },
    emailType,
    createEmailLog,
    transporter
  );

  if (!delivery.success) {
    try {
      await createNotification({
        organizationId,
        userId: null,
        type: "email_delivery_failed",
        title: "Email delivery failed",
        message: `Certificate ${certificate.certificate_id} could not be sent to ${certificate.recipient_email}.`,
      });
    } catch (error: unknown) {
      console.error(
        "Notification creation failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  return delivery;
};

export const listCertificateEmailHistory = async (
  organizationId: string,
  certificateId: string
): Promise<{ success: true; emails: SafeEmailLog[] }> => {
  assertValidUuid(certificateId);

  const logs = await findEmailLogsByCertificateAndOrganization(
    certificateId,
    organizationId
  );

  if (!logs) {
    throw new HttpError(404, "Certificate not found");
  }

  return {
    success: true,
    emails: logs.map(toSafeEmailLog),
  };
};
