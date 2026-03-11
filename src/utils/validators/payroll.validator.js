import { body, param } from "express-validator";

export const createPayrollRunRules = [
  body("month")
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("month must be in YYYY-MM format"),
];

export const approvePayrollRules = [
  param("id").isMongoId().withMessage("Invalid payroll run ID"),
];

export const disbursePayrollRules = [
  param("id").isMongoId().withMessage("Invalid payroll run ID"),
];
