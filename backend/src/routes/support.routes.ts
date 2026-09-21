import { Router } from "express";
import {
  dashboard,
  reports,
  notifications,
  notificationRead,
  notificationsReadAll,
  profile,
  profileUpdate,
  settings,
  settingsUpdate,
  passwordUpdate,
} from "../controllers/support.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticateJwt);
router.get("/dashboard", dashboard);
router.get("/reports/certificates", reports);
router.get("/notifications", notifications);
router.patch("/notifications/read-all", notificationsReadAll);
router.patch("/notifications/:id/read", notificationRead);
router.get("/profile", profile);
router.put("/profile", profileUpdate);
router.put("/profile/password", passwordUpdate);
router.get("/settings", settings);
router.put("/settings", settingsUpdate);
export default router;
