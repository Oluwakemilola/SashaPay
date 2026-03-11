import { body } from "express-validator";

export const registerOrgRules = [
  body("orgName").trim().notEmpty().withMessage("orgName is required"),
  body("orgEmail").isEmail().withMessage("Valid orgEmail is required").normalizeEmail(),
  body("industry").trim().notEmpty().withMessage("industry is required"),
  body("adminName").trim().notEmpty().withMessage("adminName is required"),
  body("adminEmail").isEmail().withMessage("Valid adminEmail is required").normalizeEmail(),
  body("adminPassword")
    .isLength({ min: 6 })
    .withMessage("adminPassword must be at least 6 characters"),
];

export const registerStaffRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  body("inviteCode").trim().notEmpty().withMessage("inviteCode is required"),
];

export const loginRules = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("password is required"),
];
