import { body, query } from "express-validator";

export const clockInRules = [
  // No body required — worker identity comes from JWT
];

export const clockOutRules = [
  // No body required
];

export const orgSummaryRules = [
  query("date")
    .optional()
    .isISO8601()
    .withMessage("date must be a valid ISO8601 date (YYYY-MM-DD)"),
  query("startDate").optional().isISO8601().withMessage("startDate must be a valid ISO8601 date"),
  query("endDate").optional().isISO8601().withMessage("endDate must be a valid ISO8601 date"),
];
