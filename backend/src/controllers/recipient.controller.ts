import type { Request, Response } from "express";
import {
  addRecipient,
  getRecipient,
  listRecipients,
  removeRecipient,
  updateRecipient,
} from "../services/recipient.service.js";
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
    "Recipient request failed:",
    error instanceof Error ? error.message : "Unknown error"
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

const getOrganizationId = (req: Request): string => {
  if (!req.authUser) {
    throw new HttpError(401, "Authentication required");
  }

  return req.authUser.organizationId;
};

const getRouteParam = (req: Request, paramName: string): string => {
  const value = req.params[paramName];

  if (typeof value !== "string") {
    throw new HttpError(404, "Recipient not found");
  }

  return value;
};

export const index = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await listRecipients(getOrganizationId(req), req.query.search);

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getRecipient(getOrganizationId(req), getRouteParam(req, "id"));

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await addRecipient(getOrganizationId(req), req.body as unknown);

    res.status(201).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await updateRecipient(
      getOrganizationId(req),
      getRouteParam(req, "id"),
      req.body as unknown
    );

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const destroy = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await removeRecipient(getOrganizationId(req), getRouteParam(req, "id"));

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};
