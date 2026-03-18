import { validationResult } from "express-validator";

/**
 * validate(rules)
 *
 * Middleware factory that runs an array of express-validator rules,
 * then checks the result. If there are validation errors, it short-circuits
 * the request with a 422 and a structured error list.
 *
 * Usage:
 *   router.post("/register-org", validate(registerOrgRules), registerOrg);
 */
export const validate = (rules) => async (req, res, next) => {
  // Run each rule
  for (const rule of rules) {
    await rule.run(req);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  next();
};
