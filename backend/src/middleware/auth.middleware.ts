import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/http-error.js";
import { verifyJwtToken } from "../services/auth.service.js";

const unauthorized = (res: Response): void => {
  res.status(401).json({
    success: false,
    message: "Invalid or expired token",
  });
};

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authorizationHeader = req.header("Authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  try {
    req.authUser = verifyJwtToken(token);
    next();
  } catch (error: unknown) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError ||
      error instanceof HttpError
    ) {
      unauthorized(res);
      return;
    }

    console.error(
      "JWT authentication failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    unauthorized(res);
  }
};
