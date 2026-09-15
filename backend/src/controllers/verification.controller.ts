import type { Request, Response } from "express";
import { verifyCertificate } from "../services/verification.service.js";
import { HttpError } from "../utils/http-error.js";

export const show = async (req: Request, res: Response): Promise<void> => {
  try {
    const certificateId = req.params.certificateId;

    if (typeof certificateId !== "string") {
      throw new HttpError(404, "Certificate not found");
    }

    const result = await verifyCertificate(certificateId);

    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof HttpError && error.statusCode === 404) {
      res.status(404).json({
        success: false,
        status: "not_found",
        message: "Certificate not found",
      });
      return;
    }

    console.error(
      "Verification request failed:",
      error instanceof Error ? error.message : "Unknown error"
    );

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
