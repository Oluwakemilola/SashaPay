import FinancialPassport from "../models/FinancialPassport.js";

// ─────────────────────────────────────────────────────────────────────────────
// getMyPassport
// GET /api/passport/me
// ─────────────────────────────────────────────────────────────────────────────
export const getMyPassport = async (req, res) => {
  try {
    const passport = await FinancialPassport.findOne({ worker: req.user._id })
      .populate("worker", "name email department")
      .populate("payments.organization", "name industry");

    if (!passport) {
      return res.status(404).json({
        success: false,
        message: "No financial passport found yet. Passport is generated after first successful salary payment.",
      });
    }

    return res.json({ success: true, passport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getWorkerPassport
// GET /api/passport/:workerId   (ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
export const getWorkerPassport = async (req, res) => {
  try {
    const passport = await FinancialPassport.findOne({ worker: req.params.workerId })
      .populate("worker", "name email department salary")
      .populate("payments.organization", "name industry");

    if (!passport) {
      return res.status(404).json({
        success: false,
        message: "No financial passport found for this worker",
      });
    }

    return res.json({ success: true, passport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
