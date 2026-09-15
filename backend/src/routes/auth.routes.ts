import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { forgot, reset } from "../controllers/support.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgot);
router.post("/reset-password", reset);
router.get("/me", authenticateJwt, me);

export default router;
