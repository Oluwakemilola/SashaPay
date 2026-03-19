import { Router } from "express";
import { listStaff } from "../controllers/staff.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const staffRouter = Router();

// Only Admins and Managers can see the full staff list
staffRouter.get("/", protect, authorize("ADMIN", "MANAGER"), listStaff);

export default staffRouter;
