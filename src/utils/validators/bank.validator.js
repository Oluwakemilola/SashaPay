import { body } from "express-validator";

export const addBankAccountRules = [
  body("bankName").trim().notEmpty().withMessage("bankName is required"),
  body("bankCode").trim().notEmpty().withMessage("bankCode is required"),
  body("accountNumber")
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage("accountNumber must be exactly 10 digits")
    .isNumeric()
    .withMessage("accountNumber must be numeric"),
];
