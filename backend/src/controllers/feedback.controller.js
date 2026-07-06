import Feedback from "../models/Feedback.js";

// ─────────────────────────────────────────────
// submitFeedback — POST /api/feedback
// ─────────────────────────────────────────────
export const submitFeedback = async (req, res) => {
  try {
    const { contextType, contextId, rating, message } = req.body;

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
    res.status(500).json({ success: false, message: err.message });
  }
};
