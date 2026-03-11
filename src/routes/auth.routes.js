import { Router } from "express";
import {
  registerOrg,
  registerStaff,
  login,
  getMe,
  refreshInvite,
} from "../controllers/auth.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  registerOrgRules,
  registerStaffRules,
  loginRules,
} from "../utils/validators/auth.validator.js";

const authRouter = Router();

// Public routes — no token needed
authRouter.post("/register-org", validate(registerOrgRules),   registerOrg);     // Create new org + admin
authRouter.post("/register",     validate(registerStaffRules), registerStaff);   // Staff join with invite code
authRouter.post("/login",        validate(loginRules),         login);           // Login → returns JWT

// Protected routes — valid JWT required
authRouter.get("/me",            protect, getMe);              // Get current user

// Admin routes
authRouter.post("/refresh-invite", protect, authorize("ADMIN"), refreshInvite); // Generate new invite code

export default authRouter;