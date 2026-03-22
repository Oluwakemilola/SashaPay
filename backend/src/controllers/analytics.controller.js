import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import PayrollRun from "../models/PayrollRun.js";
import Transfer from "../models/Transfer.js";
import Eligibility from "../models/Eligibility.js";
import { getCurrentMonth } from "../utils/eligibility.util.js";

// ─────────────────────────────────────────────
// dashboard — GET /api/analytics/dashboard
// ─────────────────────────────────────────────
export const dashboard = async (req, res) => {
  try {
    const orgId = req.user.organization;
    const month = getCurrentMonth();

    const [totalWorkers, activeWorkers, currentPayroll, allPayrolls] = await Promise.all([
      User.countDocuments({ organization: orgId, role: "WORKER" }),
      User.countDocuments({ organization: orgId, role: "WORKER", isActive: true }),
      PayrollRun.findOne({ organization: orgId, month }),
      PayrollRun.find({ organization: orgId, status: "COMPLETED" }),
    ]);

    const totalDisbursed = allPayrolls.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

    // ── Attendance rate: last 30 days (not just today) ──
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [presentCount, totalCount] = await Promise.all([
      Attendance.countDocuments({
        organization: orgId,
        date:   { $gte: thirtyDaysAgo },
        status: { $in: ["PRESENT", "LATE"] },
      }),
      Attendance.countDocuments({
        organization: orgId,
        date: { $gte: thirtyDaysAgo },
      }),
    ]);

    const attendanceRate = totalCount > 0
      ? Math.round((presentCount / totalCount) * 100)
      : 0;

    // ── Today's attendance for the stat card ──
    const today       = new Date();
    const startOfDay  = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayAttendance = await Attendance.countDocuments({
      organization: orgId,
      date:   startOfDay,
      status: { $in: ["PRESENT", "LATE"] },
    });

    // ── Only show active payroll run (not completed) ──
    const activePayroll = currentPayroll && currentPayroll.status !== "COMPLETED"
      ? currentPayroll
      : null;

    return res.json({
      success: true,
      dashboard: {
        totalWorkers,
        activeWorkers,
        todayAttendance,
        attendanceRate,
        currentMonth:      month,
        currentPayroll:    activePayroll,
        totalDisbursedNGN: Math.round(totalDisbursed / 100),
        completedPayrolls: allPayrolls.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// workforceHealth — GET /api/analytics/workforce-health
// ─────────────────────────────────────────────
export const workforceHealth = async (req, res) => {
  try {
    const orgId = req.user.organization;
    const month = req.query.month || getCurrentMonth();

    const [totalWorkers, eligibilityRecords, workers] = await Promise.all([
      User.countDocuments({ organization: orgId, role: "WORKER", isActive: true }),
      Eligibility.find({ organization: orgId, month }),
      User.find({ organization: orgId, role: "WORKER", isActive: true }, "name department"),
    ]);

    const eligibleCount = eligibilityRecords.filter((e) => e.isEligible).length;
    const avgAttendance = eligibilityRecords.length > 0
      ? Math.round(eligibilityRecords.reduce((s, e) => s + e.attendancePercent, 0) / eligibilityRecords.length)
      : 0;

    // Department breakdown — whole numbers only
    const deptMap = {};
    workers.forEach((w) => {
      const dept = w.department || "Unassigned";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const departments = Object.entries(deptMap).map(([name, count]) => ({
      name,
      count: Math.round(count), // always whole number
    }));

    return res.json({
      success: true,
      month,
      workforceHealth: {
        totalWorkers,
        eligibleWorkers:      eligibleCount,
        ineligibleWorkers:    totalWorkers - eligibleCount,
        eligibilityRate:      totalWorkers > 0 ? Math.round((eligibleCount / totalWorkers) * 100) : 0,
        avgAttendancePercent: avgAttendance,
        departments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
                                 
