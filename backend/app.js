import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./src/config/env.js";
import connectDB from "./src/database/mongodb.js";

// ── Route imports ─────────────────────────────────────────────────────────────
import authRouter from "./src/routes/auth.routes.js";
import bankAccRouter from "./src/routes/bankAccount.routes.js";
import attendanceRoutes   from "./src/routes/attendance.routes.js";
import eligibilityRoutes  from "./src/routes/eligibility.routes.js";
import payrollRoutes      from "./src/routes/payroll.routes.js";
import passportRoutes     from "./src/routes/passport.routes.js";
import analyticsRoutes    from "./src/routes/analytics.routes.js";
import agentRoutes        from "./src/routes/agent.routes.js";
import staffRoutes        from "./src/routes/staff.routes.js";

const app = express();

// Middleware
app.use(cors());

// Webhook MUST be parsed as raw body for HMAC verification
app.use(
  "/api/payroll/webhook",
  express.raw({ type: "application/json" })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/bank", bankAccRouter); // Note: Moved from /bank-accounts to /bank per spec
app.use("/api/attendance",    attendanceRoutes);
app.use("/api/eligibility",   eligibilityRoutes);
app.use("/api/payroll",       payrollRoutes);
app.use("/api/passport",      passportRoutes);
app.use("/api/analytics",     analyticsRoutes);
app.use("/api/agent",         agentRoutes);
app.use("/api/staff",         staffRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "SachaPay API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start server
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

