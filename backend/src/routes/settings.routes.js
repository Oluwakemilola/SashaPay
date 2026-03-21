import { Router } from "express";
import { getSettings, setupPayment, updatePayrollPolicy } from "../controllers/settings.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const settingsRouter = Router();

// GET  /api/settings               — get org settings
settingsRouter.get("/", protect, authorize("ADMIN"), getSettings);

// POST /api/settings/payment       — connect Paystack account
settingsRouter.post("/payment", protect, authorize("ADMIN"), setupPayment);

// PATCH /api/settings/payroll-policy — update payroll policy
settingsRouter.patch("/payroll-policy", protect, authorize("ADMIN"), updatePayrollPolicy);

export default settingsRouter;
