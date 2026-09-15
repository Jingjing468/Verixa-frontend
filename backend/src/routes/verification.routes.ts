import { Router } from "express";
import { show } from "../controllers/verification.controller.js";

const router = Router();

router.get("/:certificateId", show);

export default router;
