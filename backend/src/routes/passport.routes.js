import { Router } from "express";
import { getMyPassport, getWorkerPassport } from "../controllers/passport.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const passportRouter = Router();

passportRouter.get("/me",           protect, getMyPassport);
passportRouter.get("/:workerId",    protect, authorize("ADMIN", "MANAGER"), getWorkerPassport);

export default passportRouter;
