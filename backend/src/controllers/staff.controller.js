import User from "../models/User.js";

// ── List Staff ────────────────────────────────────────────────────────────────
// GET /api/staff   (ADMIN/MANAGER)
// ─────────────────────────────────────────────────────────────────────────────
export const listStaff = async (req, res) => {
  try {
    const orgId = req.user.organization;
    
    // Find all workers in the same organization
    const staff = await User.find({ 
      organization: orgId, 
      role: "WORKER" 
    }).sort({ name: 1 });

    return res.json({
      success: true,
      staff,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
