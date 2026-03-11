import { Router } from "express";
import { chat, history } from "../controllers/agent.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const agentRouter = Router();

agentRouter.post("/chat",    protect, chat);
agentRouter.get("/history",  protect, history);

export default agentRouter;
