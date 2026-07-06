import { body } from "express-validator";

export const submitFeedbackRules = [
  body("contextType")
    .isIn(["PAYROLL_RUN", "PAYMENT"])
    .withMessage("contextType must be PAYROLL_RUN or PAYMENT"),
  body("contextId").trim().notEmpty().withMessage("contextId is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("message must be under 1000 characters"),
];
