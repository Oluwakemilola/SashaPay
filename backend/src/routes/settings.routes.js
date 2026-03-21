import { Router } from "express";
import { getSettings, setupPayment, updatePayrollPolicy } from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const settingsRouter = Router();

settingsRouter.get("/", protect, getSettings);
settingsRouter.post("/payment", protect, setupPayment);
settingsRouter.patch("/payroll-policy", protect, updatePayrollPolicy);

export default settingsRouter;
