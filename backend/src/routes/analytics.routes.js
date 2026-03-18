import { Router } from "express";
import { dashboard, workforceHealth } from "../controllers/analytics.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const analyticsRouter = Router();

analyticsRouter.get("/dashboard",       protect, authorize("ADMIN", "MANAGER"), dashboard);
analyticsRouter.get("/workforce-health", protect, authorize("ADMIN", "MANAGER"), workforceHealth);

export default analyticsRouter;
