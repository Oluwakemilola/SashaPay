import { Router } from "express";
import {
  checkMyEligibility,
  orgSummary,
  qualifiedList,
} from "../controllers/eligibility.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const eligibilityRouter = Router();

// Worker
eligibilityRouter.get("/check",             protect, checkMyEligibility);

// Admin
eligibilityRouter.get("/org-summary",       protect, authorize("ADMIN", "MANAGER"), orgSummary);
eligibilityRouter.get("/qualified-list",    protect, authorize("ADMIN"), qualifiedList);

export default eligibilityRouter;
