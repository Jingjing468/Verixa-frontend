import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import {
  countRecipients,
  createNotification,
  createPasswordResetToken,
  getDashboardIssuanceTrend,
  getDashboardStats,
  getProfile,
  getRecentCertificates,
  getReportSummary,
  getReportTrend,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateOrganizationSettings,
  updateUserFullName,
  updateUserPasswordHash,
  usePasswordResetToken,
} from "../repositories/support.repository.js";
import { findUserByEmail } from "../repositories/auth.repository.js";
import { mapDatabaseRoleToApiRole } from "./auth.service.js";
import { sendPasswordResetEmail } from "./email.service.js";
import { HttpError } from "../utils/http-error.js";
import { getEmailConfig } from "../config/email.js";
import { getRequiredString, isRecord, isValidEmail } from "../utils/validation.js";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const statuses = new Set(["valid", "expired", "revoked"]);
const smtpEnvVars = ["SMTP_USER", "SMTP_PASS"];

const toNumber = (value: string): number => Number(value);
const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");
const getMissingSmtpEnvVars = (): string[] => smtpEnvVars.filter((name) => !process.env[name]);
const getEmailDeliveryMessage = (error: unknown): string => {
  if (!isRecord(error)) {
    return "Unable to send reset email right now. Please try again later.";
  }

  const details = [error.message, error.response, error.code]
    .filter((value): value is string => typeof value === "string")
    .join(" ");

  if (details.includes("Application-specific password required") || details.includes("534-5.7.9")) {
    return "Gmail rejected the sender login. Use a Gmail App Password for SMTP_PASS, not your normal Gmail password.";
  }

  if (details.includes("Username and Password not accepted") || details.includes("535-5.7.8")) {
    return "Gmail rejected the sender login. Check SMTP_USER and the Gmail App Password in SMTP_PASS.";
  }

  return "Unable to send reset email right now. Please try again later.";
};

const isValidDateString = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const assertUuid = (id: string, resource = "Resource"): void => {
  if (!uuidPattern.test(id)) {
    throw new HttpError(404, `${resource} not found`);
  }
};

const parseOptionalString = (
  body: Record<string, unknown>,
  fieldName: string
): string | null => {
  const value = body[fieldName];
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") throw new HttpError(400, `${fieldName} must be a string`);
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const getDashboard = async (
  organizationId: string,
  user: { fullName: string; email: string; role: string }
) => {
  const [stats, totalRecipients, recent, issuanceTrend] = await Promise.all([
    getDashboardStats(organizationId),
    countRecipients(organizationId),
    getRecentCertificates(organizationId, 8),
    getDashboardIssuanceTrend(organizationId),
  ]);

  return {
    success: true,
    user: {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    stats: {
      totalCertificates: toNumber(stats.total_certificates),
      validCertificates: toNumber(stats.valid_certificates),
      expiredCertificates: toNumber(stats.expired_certificates),
      revokedCertificates: toNumber(stats.revoked_certificates),
      totalRecipients,
      certificatesIssuedRecently: toNumber(stats.recent_certificates),
    },
    recentCertificateActivity: recent.map((item) => ({
      id: item.id,
      certificateId: item.certificate_id,
      recipientName: item.recipient_name,
      recipientEmail: item.recipient_email,
      courseName: item.course_name,
      status: item.status,
      createdAt: item.created_at.toISOString(),
    })),
    issuanceTrend: issuanceTrend.map((row) => ({
      date: row.date,
      count: toNumber(row.count),
    })),
  };
};

export const getCertificateReport = async (
  organizationId: string,
  query: Record<string, unknown>
) => {
  const status = typeof query.status === "string" && statuses.has(query.status)
    ? query.status
    : null;
  const dateFrom = typeof query.dateFrom === "string" ? query.dateFrom : null;
  const dateTo = typeof query.dateTo === "string" ? query.dateTo : null;

  if (query.status !== undefined && status === null) {
    throw new HttpError(400, "status must be valid, expired, or revoked");
  }

  if (dateFrom && !isValidDateString(dateFrom)) {
    throw new HttpError(400, "dateFrom must be a valid YYYY-MM-DD date");
  }

  if (dateTo && !isValidDateString(dateTo)) {
    throw new HttpError(400, "dateTo must be a valid YYYY-MM-DD date");
  }

  if (dateFrom && dateTo && dateTo < dateFrom) {
    throw new HttpError(400, "dateTo must be on or after dateFrom");
  }

  const [summary, trend] = await Promise.all([
    getReportSummary(organizationId, { status, dateFrom, dateTo }),
    getReportTrend(organizationId, { status, dateFrom, dateTo }),
  ]);

  return {
    success: true,
    filters: { status, dateFrom, dateTo },
    summary: {
      totalIssued: toNumber(summary.total_certificates),
      valid: toNumber(summary.valid_certificates),
      expired: toNumber(summary.expired_certificates),
      revoked: toNumber(summary.revoked_certificates),
    },
    issuanceOverTime: trend.map((row) => ({ date: row.date, count: toNumber(row.count) })),
  };
};

export const getNotifications = async (organizationId: string, userId: string) => ({
  success: true,
  notifications: (await listNotifications(organizationId, userId)).map((item) => ({
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    isRead: item.is_read,
    createdAt: item.created_at.toISOString(),
    readAt: item.read_at ? item.read_at.toISOString() : null,
  })),
});

export const readNotification = async (organizationId: string, userId: string, id: string) => {
  assertUuid(id, "Notification");
  const notification = await markNotificationRead(organizationId, userId, id);
  if (!notification) throw new HttpError(404, "Notification not found");
  return { success: true };
};

export const readAllNotifications = async (organizationId: string, userId: string) => ({
  success: true,
  updated: await markAllNotificationsRead(organizationId, userId),
});

export const getUserProfile = async (userId: string) => {
  const profile = await getProfile(userId);
  if (!profile) throw new HttpError(404, "Profile not found");
  return {
    success: true,
    profile: {
      certificateStats: { issued: profile.certificates_issued, revoked: profile.certificates_revoked, active: profile.certificates_active },
      avatarUrl: profile.avatar_url,
      fullName: profile.full_name,
      email: profile.email,
      role: mapDatabaseRoleToApiRole(profile.role),
      organization: {
        id: profile.organization_id,
        name: profile.organization_name,
        email: profile.organization_email,
        logoUrl: profile.organization_logo_url,
      },
    },
  };
};

export const updateUserProfile = async (userId: string, body: unknown) => {
  if (!isRecord(body)) throw new HttpError(400, "Request body must be a JSON object");
  const fullName = getRequiredString(body, "fullName");
  const avatarUrl = body.avatarUrl;
  if (avatarUrl !== undefined && avatarUrl !== null && (typeof avatarUrl !== 'string' || avatarUrl.length > 512 * 1024 || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(avatarUrl))) throw new HttpError(400, 'Invalid profile photo');
  const profile = await updateUserFullName(userId, fullName, avatarUrl as string | null | undefined);
  if (!profile) throw new HttpError(404, "Profile not found");
  return getUserProfile(userId);
};

export const getSettings = async (userId: string) => getUserProfile(userId);

export const updateSettings = async (
  userId: string,
  organizationId: string,
  role: string,
  body: unknown
) => {
  if (role !== "admin") throw new HttpError(403, "Only organization admins can update settings");
  if (!isRecord(body)) throw new HttpError(400, "Request body must be a JSON object");
  const name = getRequiredString(body, "organizationName");
  const logoUrl = parseOptionalString(body, "logoUrl");
  await updateOrganizationSettings(organizationId, { name, logoUrl });
  return getUserProfile(userId);
};

export const changePassword = async (userId: string, email: string, body: unknown) => {
  if (!isRecord(body)) throw new HttpError(400, "Request body must be a JSON object");
  const currentPassword = getRequiredString(body, "currentPassword");
  const newPassword = getRequiredString(body, "newPassword");
  if (newPassword.length < 8) throw new HttpError(400, "newPassword must be at least 8 characters");
  const user = await findUserByEmail(email);
  if (!user || user.id !== userId) throw new HttpError(404, "Profile not found");
  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw new HttpError(401, "Current password is incorrect");
  await updateUserPasswordHash(userId, await bcrypt.hash(newPassword, 12));
  return { success: true, message: "Password updated successfully" };
};

export const forgotPassword = async (body: unknown) => {
  if (!isRecord(body)) throw new HttpError(400, "Request body must be a JSON object");
  const email = getRequiredString(body, "email").toLowerCase();
  if (!isValidEmail(email)) throw new HttpError(400, "email must be a valid email address");
  try {
    getEmailConfig();
  } catch {
    throw new HttpError(503, "Password reset email is unavailable. Please contact support.");
  }
  const user = await findUserByEmail(email);

  if (user) {
    const token = randomBytes(32).toString("hex");
    await createPasswordResetToken(
      user.id,
      hashToken(token),
      new Date(Date.now() + 60 * 60 * 1000)
    );

    try {
      await sendPasswordResetEmail({
        recipientEmail: user.email,
        resetToken: token,
      });
    } catch (error: unknown) {
      const missingSmtpEnvVars = getMissingSmtpEnvVars();
      console.error(
        "Password reset email delivery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
      if (missingSmtpEnvVars.length > 0) {
        throw new HttpError(
          503,
          `Email service is not configured. Missing: ${missingSmtpEnvVars.join(", ")}`
        );
      }
      throw new HttpError(503, getEmailDeliveryMessage(error));
    }
  }
  return { success: true, message: "If the email exists, password reset instructions will be sent" };
};

export const resetPassword = async (body: unknown) => {
  if (!isRecord(body)) throw new HttpError(400, "Request body must be a JSON object");
  const token = getRequiredString(body, "token");
  const newPassword = getRequiredString(body, "newPassword");
  if (newPassword.length < 8) throw new HttpError(400, "newPassword must be at least 8 characters");
  const used = await usePasswordResetToken(hashToken(token), await bcrypt.hash(newPassword, 12));
  if (!used) throw new HttpError(400, "Invalid or expired reset token");
  return { success: true, message: "Password reset successfully" };
};

export { createNotification };
