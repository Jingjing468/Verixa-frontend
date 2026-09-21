import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";
import {
  getCurrentUser,
  loginWithGoogle,
  loginUser,
  registerOrganization,
} from "../services/auth.service.js";

const sendErrorResponse = (res: Response, error: unknown): void => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error("Auth request failed:", error instanceof Error ? error.message : "Unknown error");

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerOrganization(req.body as unknown);

    res.status(201).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body as unknown);

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginWithGoogle(req.body as unknown);

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, "Authentication required");
    }

    const result = await getCurrentUser(req.authUser.id);

    res.status(200).json(result);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};
