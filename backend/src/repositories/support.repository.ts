import { pool } from "../config/database.js";
import type { DatabaseUserRole } from "../types/auth.js";

export type DashboardStatsRow = {
  total_certificates: string;
  valid_certificates: string;
  expired_certificates: string;
  revoked_certificates: string;
  recent_certificates: string;
};

export type RecentCertificateRow = {
  id: string;
  certificate_id: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  status: "valid" | "expired" | "revoked";
  created_at: Date;
};

export type DashboardTrendRow = {
  date: string;
  count: string;
};

export type ReportSummaryRow = DashboardStatsRow;

export type ReportTrendRow = {
  date: string;
  count: string;
};

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
  read_at: Date | null;
};

export type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  role: DatabaseUserRole;
  organization_id: string;
  organization_name: string;
  organization_email: string;
  organization_logo_url: string | null;
};

const effectiveStatusSql = `
  CASE
    WHEN status = 'revoked' THEN 'revoked'
    WHEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE THEN 'expired'
    ELSE 'valid'
  END
`;

export const getDashboardStats = async (organizationId: string): Promise<DashboardStatsRow> => {
  const result = await pool.query<DashboardStatsRow>(
    `
      SELECT
        COUNT(*)::text AS total_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'valid')::text AS valid_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'expired')::text AS expired_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'revoked')::text AS revoked_certificates,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::text AS recent_certificates
      FROM certificates
      WHERE organization_id = $1
    `,
    [organizationId]
  );

  return result.rows[0] ?? {
    total_certificates: "0",
    valid_certificates: "0",
    expired_certificates: "0",
    revoked_certificates: "0",
    recent_certificates: "0",
  };
};

export const countRecipients = async (organizationId: string): Promise<number> => {
  const result = await pool.query<{ total: string }>(
    "SELECT COUNT(*)::text AS total FROM recipients WHERE organization_id = $1",
    [organizationId]
  );

  return Number(result.rows[0]?.total ?? 0);
};

export const getRecentCertificates = async (
  organizationId: string,
  limit: number
): Promise<RecentCertificateRow[]> => {
  const result = await pool.query<RecentCertificateRow>(
    `
      SELECT
        id,
        certificate_id,
        recipient_name,
        recipient_email,
        course_name,
        ${effectiveStatusSql} AS status,
        created_at
      FROM certificates
      WHERE organization_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
    [organizationId, limit]
  );

  return result.rows;
};

export const getDashboardIssuanceTrend = async (
  organizationId: string
): Promise<DashboardTrendRow[]> => {
  const result = await pool.query<DashboardTrendRow>(
    `
      WITH days AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS date
      )
      SELECT days.date::text AS date, COUNT(c.id)::text AS count
      FROM days
      LEFT JOIN certificates c
        ON c.organization_id = $1
        AND c.created_at::date = days.date
      GROUP BY days.date
      ORDER BY days.date ASC
    `,
    [organizationId]
  );

  return result.rows;
};

export const getReportSummary = async (
  organizationId: string,
  filters: { status: string | null; dateFrom: string | null; dateTo: string | null }
): Promise<ReportSummaryRow> => {
  const values: unknown[] = [organizationId];
  const clauses = ["organization_id = $1"];

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`issue_date >= $${values.length}`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`issue_date <= $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`${effectiveStatusSql} = $${values.length}`);
  }

  const result = await pool.query<ReportSummaryRow>(
    `
      SELECT
        COUNT(*)::text AS total_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'valid')::text AS valid_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'expired')::text AS expired_certificates,
        COUNT(*) FILTER (WHERE ${effectiveStatusSql} = 'revoked')::text AS revoked_certificates,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::text AS recent_certificates
      FROM certificates
      WHERE ${clauses.join(" AND ")}
    `,
    values
  );

  return result.rows[0] ?? {
    total_certificates: "0",
    valid_certificates: "0",
    expired_certificates: "0",
    revoked_certificates: "0",
    recent_certificates: "0",
  };
};

export const getReportTrend = async (
  organizationId: string,
  filters: { status: string | null; dateFrom: string | null; dateTo: string | null }
): Promise<ReportTrendRow[]> => {
  const values: unknown[] = [organizationId];
  const clauses = ["organization_id = $1"];

  if (filters.dateFrom) {
    values.push(filters.dateFrom);
    clauses.push(`issue_date >= $${values.length}`);
  }

  if (filters.dateTo) {
    values.push(filters.dateTo);
    clauses.push(`issue_date <= $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`${effectiveStatusSql} = $${values.length}`);
  }

  const result = await pool.query<ReportTrendRow>(
    `
      SELECT issue_date::text AS date, COUNT(*)::text AS count
      FROM certificates
      WHERE ${clauses.join(" AND ")}
      GROUP BY issue_date
      ORDER BY issue_date ASC
    `,
    values
  );

  return result.rows;
};

export const createNotification = async (input: {
  organizationId: string;
  userId: string | null;
  type: "certificate_issued" | "certificate_revoked" | "email_delivery_failed" | "system";
  title: string;
  message: string;
}): Promise<void> => {
  await pool.query(
    `
      INSERT INTO notifications (organization_id, user_id, type, title, message)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [input.organizationId, input.userId, input.type, input.title, input.message]
  );
};

export const listNotifications = async (
  organizationId: string,
  userId: string
): Promise<NotificationRow[]> => {
  const result = await pool.query<NotificationRow>(
    `
      SELECT id, type, title, message, is_read, created_at, read_at
      FROM notifications
      WHERE organization_id = $1 AND (user_id IS NULL OR user_id = $2)
      ORDER BY created_at DESC
      LIMIT 100
    `,
    [organizationId, userId]
  );

  return result.rows;
};

export const markNotificationRead = async (
  organizationId: string,
  userId: string,
  id: string
): Promise<NotificationRow | null> => {
  const result = await pool.query<NotificationRow>(
    `
      UPDATE notifications
      SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
      WHERE id = $1 AND organization_id = $2 AND (user_id IS NULL OR user_id = $3)
      RETURNING id, type, title, message, is_read, created_at, read_at
    `,
    [id, organizationId, userId]
  );

  return result.rows[0] ?? null;
};

export const markAllNotificationsRead = async (
  organizationId: string,
  userId: string
): Promise<number> => {
  const result = await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
      WHERE organization_id = $1 AND (user_id IS NULL OR user_id = $2) AND is_read = FALSE
    `,
    [organizationId, userId]
  );

  return result.rowCount ?? 0;
};

export const getProfile = async (userId: string): Promise<ProfileRow | null> => {
  const result = await pool.query<ProfileRow>(
    `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role,
        o.id AS organization_id,
        o.name AS organization_name,
        o.email AS organization_email,
        o.logo_url AS organization_logo_url
      FROM users u
      INNER JOIN organizations o ON o.id = u.organization_id
      WHERE u.id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
};

export const updateUserFullName = async (
  userId: string,
  fullName: string
): Promise<ProfileRow | null> => {
  await pool.query("UPDATE users SET full_name = $2, updated_at = NOW() WHERE id = $1", [
    userId,
    fullName,
  ]);
  return getProfile(userId);
};

export const updateOrganizationSettings = async (
  organizationId: string,
  input: { name: string; logoUrl: string | null }
): Promise<void> => {
  await pool.query(
    "UPDATE organizations SET name = $2, logo_url = $3, updated_at = NOW() WHERE id = $1",
    [organizationId, input.name, input.logoUrl]
  );
};

export const updateUserPasswordHash = async (
  userId: string,
  passwordHash: string
): Promise<void> => {
  await pool.query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1", [
    userId,
    passwordHash,
  ]);
};

export const createPasswordResetToken = async (
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> => {
  await pool.query(
    `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt]
  );
};

export const usePasswordResetToken = async (
  tokenHash: string,
  passwordHash: string
): Promise<boolean> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const tokenResult = await client.query<{ user_id: string }>(
      `
        SELECT user_id
        FROM password_reset_tokens
        WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
        LIMIT 1
        FOR UPDATE
      `,
      [tokenHash]
    );
    const token = tokenResult.rows[0];

    if (!token) {
      await client.query("ROLLBACK");
      return false;
    }

    await client.query("UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1", [
      token.user_id,
      passwordHash,
    ]);
    await client.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = $1",
      [tokenHash]
    );
    await client.query("COMMIT");
    return true;
  } catch (error: unknown) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
