import { Router } from "express";
import { listStaff, updateStaff } from "../controllers/staff.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const staffRouter = Router();

// GET /api/staff — list all workers in org
staffRouter.get("/", protect, authorize("ADMIN", "MANAGER"), listStaff);

// PATCH /api/staff/:id — update worker salary + department
staffRouter.patch("/:id", protect, authorize("ADMIN"), updateStaff);

export default staffRouter;
