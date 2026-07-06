import { body } from "express-validator";
import mongoose from "mongoose";

export const submitFeedbackRules = [
  body("contextType")
    .isIn(["PAYROLL_RUN", "PAYMENT"])
    .withMessage("contextType must be PAYROLL_RUN or PAYMENT"),
  body("contextId")
    .trim()
    .notEmpty()
    .withMessage("contextId is required")
    .custom((value, { req }) => {
      if (req.body.contextType === "PAYROLL_RUN" && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("contextId must be a valid PayrollRun id for PAYROLL_RUN feedback");
      }
      if (req.body.contextType === "PAYMENT" && !/^\d{4}-\d{2}$/.test(value)) {
        throw new Error("contextId must be a YYYY-MM month string for PAYMENT feedback");
      }
      return true;
    }),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be between 1 and 5"),
  body("message")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("message must be under 1000 characters"),
];
