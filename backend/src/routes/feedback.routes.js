import { Router } from "express";
import { submitFeedback } from "../controllers/feedback.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { submitFeedbackRules } from "../utils/validators/feedback.validator.js";

const feedbackRouter = Router();

feedbackRouter.use(protect);

feedbackRouter.post("/", validate(submitFeedbackRules), submitFeedback);

export default feedbackRouter;
