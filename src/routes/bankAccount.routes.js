import { Router } from "express";
import {
  addBankAccount,
  getMyAccounts,
  setPrimary,
  deleteAccount,
  getStaffAccounts,
} from "../controllers/bankAccount.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addBankAccountRules } from "../utils/validators/bank.validator.js";

const bankAccRouter = Router();

// All routes require login
bankAccRouter.use(protect);

// ── Worker routes ─────────────────────────────────────────────────────────────
bankAccRouter.post(  "/",                  validate(addBankAccountRules), addBankAccount);   // Add + verify a new account
bankAccRouter.get(   "/",                  getMyAccounts);    // View own accounts
bankAccRouter.patch( "/:id/set-primary",   setPrimary);       // Switch primary account
bankAccRouter.delete("/:id",               deleteAccount);    // Remove an account

// ── Admin / Manager routes ────────────────────────────────────────────────────
// View any staff member's bank accounts — used in payroll run screen
bankAccRouter.get("/staff/:userId", authorize("ADMIN", "MANAGER"), getStaffAccounts);

export default bankAccRouter;