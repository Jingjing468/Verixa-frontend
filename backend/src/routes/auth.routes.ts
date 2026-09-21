import { Router } from "express";
import { googleLogin, login, me, register } from "../controllers/auth.controller.js";
import { forgot, reset } from "../controllers/support.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/forgot-password", forgot);
router.post("/reset-password", reset);
router.get("/me", authenticateJwt, me);

export default router;
