import { Router } from "express";
import {
  createRun,
  approveRun,
  disburseRun,
  retryFailed,
  webhook,
  history,
  getOne,
} from "../controllers/payroll.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createPayrollRunRules,
  approvePayrollRules,
  disbursePayrollRules,
} from "../utils/validators/payroll.validator.js";

const payrollRouter = Router();

// ── Webhook (public — verified by HMAC signature inside controller) ───────────
payrollRouter.post("/webhook", webhook);

// ── Admin-only routes ─────────────────────────────────────────────────────────
payrollRouter.post(
  "/run",
  protect,
  authorize("ADMIN"),
  validate(createPayrollRunRules),
  createRun
);

payrollRouter.patch(
  "/:id/approve",
  protect,
  authorize("ADMIN"),
  validate(approvePayrollRules),
  approveRun
);

payrollRouter.post(
  "/:id/disburse",
  protect,
  authorize("ADMIN"),
  validate(disbursePayrollRules),
  disburseRun
);

payrollRouter.post(
  "/:id/retry-failed",
  protect,
  authorize("ADMIN"),
  retryFailed
);

payrollRouter.get("/history", protect, authorize("ADMIN", "MANAGER"), history);
payrollRouter.get("/:id",     protect, authorize("ADMIN", "MANAGER"), getOne);

export default payrollRouter;
