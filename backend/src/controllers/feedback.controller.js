import Feedback from "../models/Feedback.js";
import PayrollRun from "../models/PayrollRun.js";
import FinancialPassport from "../models/FinancialPassport.js";

// ─────────────────────────────────────────────
// submitFeedback — POST /api/feedback
// ─────────────────────────────────────────────
export const submitFeedback = async (req, res) => {
  try {
    const { contextType, contextId, rating, message } = req.body;

    // Confirm contextId actually refers to a real record the requester owns,
    // rather than trusting an arbitrary client-supplied id/org.
    if (contextType === "PAYROLL_RUN") {
      const run = await PayrollRun.findOne({
        _id: contextId,
        organization: req.user.organization,
      });
      if (!run) {
        return res.status(404).json({ success: false, message: "Payroll run not found." });
      }
    } else {
      const passport = await FinancialPassport.findOne({
        worker: req.user._id,
        "payments.month": contextId,
      });
      if (!passport) {
        return res.status(404).json({ success: false, message: "Payment not found for that month." });
      }
    }

    const feedback = await Feedback.findOneAndUpdate(
      { user: req.user._id, contextType, contextId },
      {
        organization: req.user.organization,
        role: req.user.role,
        rating,
        message,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    // A racing double-submit for the same context can hit the unique index
    // on insert — treat that as a harmless "already recorded" success.
    if (err.code === 11000) {
      return res.status(200).json({ success: true, message: "Feedback already recorded." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};
