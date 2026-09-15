import type { Request, Response } from "express";
import {
  listCertificateEmailHistory,
  sendCertificateEmail,
} from "../services/certificate-email.service.js";
import {
  addCertificate,
  getCertificatePdfDownload,
  getCertificate,
  listCertificates,
  listCertificateRevocations,
  regenerateCertificatePdf,
  revokeCertificate,
  updateCertificate,
} from "../services/certificate.service.js";
import { HttpError } from "../utils/http-error.js";

const sendErrorResponse = (res: Response, error: unknown): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error(
    "Certificate request failed:",
    error instanceof Error ? error.message : "Unknown error"
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

const getAuthenticatedContext = (
  req: Request
): { organizationId: string; userId: string } => {
  if (!req.authUser) {
    throw new HttpError(401, "Authentication required");
  }

  return {
    organizationId: req.authUser.organizationId,
    userId: req.authUser.id,
  };
};

const getRouteParam = (req: Request, paramName: string): string => {
  const value = req.params[paramName];

  if (typeof value !== "string") {
    throw new HttpError(404, "Certificate not found");
  }

  return value;
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await addCertificate(
      context.organizationId,
      context.userId,
      req.body as unknown
    );

    res.status(201).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await listCertificates(context.organizationId, req.query);

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await getCertificate(context.organizationId, getRouteParam(req, "id"));

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await updateCertificate(
      context.organizationId,
      getRouteParam(req, "id"),
      req.body as unknown
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const revoke = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await revokeCertificate(
      context.organizationId,
      context.userId,
      getRouteParam(req, "id"),
      req.body as unknown
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const revocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await listCertificateRevocations(
      context.organizationId,
      getRouteParam(req, "id")
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const downloadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await getCertificatePdfDownload(
      context.organizationId,
      getRouteParam(req, "id")
    );

    res.download(result.filePath, result.fileName);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const regeneratePdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await regenerateCertificatePdf(
      context.organizationId,
      getRouteParam(req, "id")
    );

    res.status(200).json({
      success: true,
      pdfUrl: result.pdfUrl,
    });
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await sendCertificateEmail(
      context.organizationId,
      getRouteParam(req, "id"),
      "certificate_resent"
    );

    res.status(result.success ? 200 : 502).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const emails = async (req: Request, res: Response): Promise<void> => {
  try {
    const context = getAuthenticatedContext(req);
    const result = await listCertificateEmailHistory(
      context.organizationId,
      getRouteParam(req, "id")
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};
