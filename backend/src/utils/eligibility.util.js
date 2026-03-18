import Attendance from "../models/Attendance.js";
import Eligibility from "../models/Eligibility.js";

// ─────────────────────────────────────────────────────────────────────────────
// calculateEligibility
//
// Computes and upserts an Eligibility record for a given worker + month.
//
// Policy:
//   FIXED_SALARY   → always eligible
//   ATTENDANCE_BASED → attendancePercent >= organization.thresholdPercent
//
// Returns the saved Eligibility document.
// ─────────────────────────────────────────────────────────────────────────────
export const calculateEligibility = async (worker, organization, month) => {
  // month format: "YYYY-MM"
  const [year, monthNum] = month.split("-").map(Number);

  // Build date range for the month
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth   = new Date(year, monthNum, 0, 23, 59, 59, 999); // last day

  // Only count working days that have already elapsed (up to today)
  const today = new Date();
  const rangeEnd = endOfMonth < today ? endOfMonth : today;

  let daysAttended        = 0;
  let workingDaysElapsed  = 0;
  let attendancePercent   = 0;
  let isEligible          = false;

  if (organization.payrollPolicy === "FIXED_SALARY") {
    // Under a fixed salary policy every active worker is always eligible
    isEligible = true;

    // Still calculate attendance for informational purposes
    const records = await Attendance.find({
      worker: worker._id,
      organization: organization._id,
      date: { $gte: startOfMonth, $lte: rangeEnd },
      status: { $in: ["PRESENT", "LATE"] },
    });
    daysAttended = records.length;

    const allRecords = await Attendance.countDocuments({
      organization: organization._id,
      date: { $gte: startOfMonth, $lte: rangeEnd },
      worker: worker._id,
    });
    workingDaysElapsed = allRecords;
    attendancePercent  = workingDaysElapsed > 0
      ? Math.round((daysAttended / workingDaysElapsed) * 100)
      : 100;
  } else {
    // ATTENDANCE_BASED — count PRESENT + LATE as attendance
    const presentRecords = await Attendance.countDocuments({
      worker: worker._id,
      organization: organization._id,
      date: { $gte: startOfMonth, $lte: rangeEnd },
      status: { $in: ["PRESENT", "LATE"] },
    });

    const totalRecords = await Attendance.countDocuments({
      worker: worker._id,
      organization: organization._id,
      date: { $gte: startOfMonth, $lte: rangeEnd },
    });

    daysAttended       = presentRecords;
    workingDaysElapsed = totalRecords;

    attendancePercent = workingDaysElapsed > 0
      ? Math.round((daysAttended / workingDaysElapsed) * 100)
      : 0;

    isEligible = attendancePercent >= (organization.thresholdPercent ?? 70);
  }

  // Upsert — recalculating always overwrites the previous result
  const eligibility = await Eligibility.findOneAndUpdate(
    { worker: worker._id, month },
    {
      worker:              worker._id,
      organization:        organization._id,
      month,
      daysAttended,
      workingDaysElapsed,
      attendancePercent,
      isEligible,
      calculatedAt:        new Date(),
    },
    { upsert: true, new: true }
  );

  return eligibility;
};

// ─────────────────────────────────────────────────────────────────────────────
// getCurrentMonth
//
// Returns the current month string in "YYYY-MM" format.
// ─────────────────────────────────────────────────────────────────────────────
export const getCurrentMonth = () => {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// isWorkingDay
//
// Returns true if the given date is Monday–Friday.
// ─────────────────────────────────────────────────────────────────────────────
export const isWorkingDay = (date) => {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day >= 1 && day <= 5;
};
