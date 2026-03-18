import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

// Late threshold: 8:15 AM
const LATE_HOUR   = 8;
const LATE_MINUTE = 15;

// ─────────────────────────────────────────────────────────────────────────────
// clockIn
// POST /api/attendance/clock-in
// ─────────────────────────────────────────────────────────────────────────────
export const clockIn = async (req, res) => {
  try {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const checkInHour   = now.getHours();
    const checkInMinute = now.getMinutes();

    const isLate =
      checkInHour > LATE_HOUR ||
      (checkInHour === LATE_HOUR && checkInMinute > LATE_MINUTE);

    const lateMinutes = isLate
      ? (checkInHour - LATE_HOUR) * 60 + (checkInMinute - LATE_MINUTE)
      : 0;

    const record = await Attendance.create({
      worker:       req.user._id,
      organization: req.user.organization,
      date:         today,
      checkIn:      now,
      status:       isLate ? "LATE" : "PRESENT",
      lateMinutes,
    });

    return res.status(201).json({
      success: true,
      message: isLate ? `Clocked in — ${lateMinutes} minutes late` : "Clocked in successfully",
      attendance: record,
    });
  } catch (error) {
    // Duplicate key = already clocked in today
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already clocked in today",
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// clockOut
// POST /api/attendance/clock-out
// ─────────────────────────────────────────────────────────────────────────────
export const clockOut = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const record = await Attendance.findOne({
      worker: req.user._id,
      date:   startOfDay,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No clock-in record found for today",
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: "You have already clocked out today",
      });
    }

    record.checkOut = today;
    // Hours worked = difference in milliseconds → hours
    record.hoursWorked = parseFloat(
      ((today - record.checkIn) / (1000 * 60 * 60)).toFixed(2)
    );
    await record.save();

    return res.json({
      success: true,
      message: "Clocked out successfully",
      attendance: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// myRecords
// GET /api/attendance/my-records
// ─────────────────────────────────────────────────────────────────────────────
export const myRecords = async (req, res) => {
  try {
    const { month } = req.query; // optional "YYYY-MM"

    const filter = { worker: req.user._id };

    if (month) {
      const [y, m] = month.split("-").map(Number);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(y, m, 0, 23, 59, 59),
      };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    return res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// orgSummary
// GET /api/attendance/org-summary  (ADMIN only)
// ─────────────────────────────────────────────────────────────────────────────
export const orgSummary = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    const filter = { organization: req.user.organization };

    if (date) {
      const d = new Date(date);
      filter.date = {
        $gte: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        $lte: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59),
      };
    } else if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Attendance.find(filter)
      .populate("worker", "name email department")
      .sort({ date: -1 });

    // Summary counts
    const summary = {
      total:   records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      late:    records.filter((r) => r.status === "LATE").length,
      absent:  records.filter((r) => r.status === "ABSENT").length,
    };

    return res.json({ success: true, summary, attendance: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
