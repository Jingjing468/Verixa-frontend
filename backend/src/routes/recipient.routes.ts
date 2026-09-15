import { Router } from "express";
import {
  create,
  destroy,
  index,
  show,
  update,
} from "../controllers/recipient.controller.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", index);
router.get("/:id", show);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;
