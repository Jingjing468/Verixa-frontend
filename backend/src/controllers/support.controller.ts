import type { Request, Response } from "express";
import {
  changePassword,
  forgotPassword,
  getCertificateReport,
  getDashboard,
  getNotifications,
  getSettings,
  getUserProfile,
  readAllNotifications,
  readNotification,
  resetPassword,
  updateSettings,
  updateUserProfile,
} from "../services/support.service.js";
import { HttpError } from "../utils/http-error.js";

const sendError = (res: Response, error: unknown): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ success: false, message: error.message });
    return;
  }
  console.error("Support request failed:", error instanceof Error ? error.message : "Unknown error");
  res.status(500).json({ success: false, message: "Internal server error" });
};

const auth = (req: Request) => {
  if (!req.authUser) throw new HttpError(401, "Authentication required");
  return req.authUser;
};

const routeParam = (value: string | string[] | undefined): string =>
  typeof value === "string" ? value : "";

export const dashboard = async (req: Request, res: Response) => {
  try { res.json(await getDashboard(auth(req).organizationId)); } catch (e) { sendError(res, e); }
};
export const reports = async (req: Request, res: Response) => {
  try { res.json(await getCertificateReport(auth(req).organizationId, req.query)); } catch (e) { sendError(res, e); }
};
export const notifications = async (req: Request, res: Response) => {
  try { const user = auth(req); res.json(await getNotifications(user.organizationId, user.id)); } catch (e) { sendError(res, e); }
};
export const notificationRead = async (req: Request, res: Response) => {
  try { const user = auth(req); res.json(await readNotification(user.organizationId, user.id, routeParam(req.params.id))); } catch (e) { sendError(res, e); }
};
export const notificationsReadAll = async (req: Request, res: Response) => {
  try { const user = auth(req); res.json(await readAllNotifications(user.organizationId, user.id)); } catch (e) { sendError(res, e); }
};
export const profile = async (req: Request, res: Response) => {
  try { res.json(await getUserProfile(auth(req).id)); } catch (e) { sendError(res, e); }
};
export const profileUpdate = async (req: Request, res: Response) => {
  try { res.json(await updateUserProfile(auth(req).id, req.body)); } catch (e) { sendError(res, e); }
};
export const settings = async (req: Request, res: Response) => {
  try { res.json(await getSettings(auth(req).id)); } catch (e) { sendError(res, e); }
};
export const settingsUpdate = async (req: Request, res: Response) => {
  try { const user = auth(req); res.json(await updateSettings(user.id, user.organizationId, user.role, req.body)); } catch (e) { sendError(res, e); }
};
export const passwordUpdate = async (req: Request, res: Response) => {
  try { const user = auth(req); res.json(await changePassword(user.id, user.email, req.body)); } catch (e) { sendError(res, e); }
};
export const forgot = async (req: Request, res: Response) => {
  try { res.json(await forgotPassword(req.body)); } catch (e) { sendError(res, e); }
};
export const reset = async (req: Request, res: Response) => {
  try { res.json(await resetPassword(req.body)); } catch (e) { sendError(res, e); }
};
