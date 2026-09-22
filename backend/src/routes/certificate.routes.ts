import { Router } from "express";
import {
  create,
  downloadPdf,
  downloadQrCode,
  emails,
  index,
  regeneratePdf,
  revoke,
  revocations,
  sendEmail,
  show,
  update,
} from "../controllers/certificate.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", index);
router.get("/:id", show);
router.get("/:id/revocations", revocations);
router.get("/:id/emails", emails);
router.get("/:id/pdf", downloadPdf);
router.get("/:id/qr", downloadQrCode);
router.post("/", create);
router.post("/:id/revoke", revoke);
router.post("/:id/send", sendEmail);
router.post("/:id/pdf/regenerate", regeneratePdf);
router.put("/:id", update);

export default router;
