import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import PayrollRun from "../models/PayrollRun.js";
import Transfer from "../models/Transfer.js";
import Eligibility from "../models/Eligibility.js";
import { getCurrentMonth } from "../utils/eligibility.util.js";

// ─────────────────────────────────────────────────────────────────────────────
// dashboard
// GET /api/analytics/dashboard   (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
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

    // Attendance rate for today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayAttendance = await Attendance.countDocuments({
      organization: orgId,
      date:         startOfDay,
      status:       { $in: ["PRESENT", "LATE"] },
    });

    return res.json({
      success: true,
      dashboard: {
        totalWorkers,
        activeWorkers,
        todayAttendance,
        attendanceRate: activeWorkers > 0 ? Math.round((todayAttendance / activeWorkers) * 100) : 0,
        currentMonth:    month,
        currentPayroll:  currentPayroll || null,
        totalDisbursedNGN: Math.round(totalDisbursed / 100), // kobo → NGN
        completedPayrolls: allPayrolls.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// workforceHealth
// GET /api/analytics/workforce-health   (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
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
    const avgAttendance  =
      eligibilityRecords.length > 0
        ? Math.round(
            eligibilityRecords.reduce((s, e) => s + e.attendancePercent, 0) /
              eligibilityRecords.length
          )
        : 0;

    // Department breakdown
    const deptMap = {};
    workers.forEach((w) => {
      const dept = w.department || "Unassigned";
      deptMap[dept] = (deptMap[dept] || 0) + 1;
    });
    const departments = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    return res.json({
      success: true,
      month,
      workforceHealth: {
        totalWorkers,
        eligibleWorkers:   eligibleCount,
        ineligibleWorkers: totalWorkers - eligibleCount,
        eligibilityRate:   totalWorkers > 0 ? Math.round((eligibleCount / totalWorkers) * 100) : 0,
        avgAttendancePercent: avgAttendance,
        departments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
