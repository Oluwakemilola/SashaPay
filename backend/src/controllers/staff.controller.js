import User from "../models/User.js";

// ─────────────────────────────────────────────
// listStaff
// GET /api/staff   (ADMIN/MANAGER)
// ─────────────────────────────────────────────
export const listStaff = async (req, res) => {
  try {
    const orgId = req.user.organization;
    const staff = await User.find({
      organization: orgId,
      role: "WORKER",
    }).sort({ name: 1 });
    return res.json({ success: true, staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// updateStaff
// PATCH /api/staff/:id   (ADMIN only)
// Updates salary, department for a worker
// ─────────────────────────────────────────────
export const updateStaff = async (req, res) => {
  try {
    const { id }  = req.params;
    const orgId   = req.user.organization;
    const { salary, department, jobTitle, isActive } = req.body;

    const worker = await User.findOne({ _id: id, organization: orgId, role: "WORKER" });
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    if (salary     !== undefined) worker.salary     = Number(salary);
    if (department !== undefined) worker.department = department;
    if (jobTitle   !== undefined) worker.jobTitle   = jobTitle;
    if (isActive   !== undefined) worker.isActive   = isActive;

    await worker.save();
    return res.json({ success: true, message: "Worker updated successfully", worker });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
