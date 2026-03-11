import { Router } from "express";
import { clockIn, clockOut, myRecords, orgSummary } from "../controllers/attendance.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { orgSummaryRules } from "../utils/validators/attendance.validator.js";

const attendanceRouter = Router();

// Worker routes
attendanceRouter.post("/clock-in",    protect, clockIn);
attendanceRouter.post("/clock-out",   protect, clockOut);
attendanceRouter.get("/my-records",   protect, myRecords);

// Admin routes
attendanceRouter.get(
  "/org-summary",
  protect,
  authorize("ADMIN", "MANAGER"),
  validate(orgSummaryRules),
  orgSummary
);

export default attendanceRouter;
