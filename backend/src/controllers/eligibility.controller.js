import User from "../models/User.js";
import Organization from "../models/Organization.js";
import Eligibility from "../models/Eligibility.js";
import { calculateEligibility, getCurrentMonth } from "../utils/eligibility.util.js";

// ─────────────────────────────────────────────────────────────────────────────
// checkMyEligibility
// GET /api/eligibility/check
// Worker checks their own eligibility for the current (or specified) month
// ─────────────────────────────────────────────────────────────────────────────
export const checkMyEligibility = async (req, res) => {
  try {
    const month = req.query.month || getCurrentMonth();
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const eligibility = await calculateEligibility(req.user, organization, month);

    return res.json({ success: true, eligibility });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// orgSummary
// GET /api/eligibility/org-summary   (ADMIN)
// Admin sees all workers' eligibility for a given month
// ─────────────────────────────────────────────────────────────────────────────
export const orgSummary = async (req, res) => {
  try {
    const month        = req.query.month || getCurrentMonth();
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Get all active workers in the org
    const workers = await User.find({
      organization: req.user.organization,
      role:         "WORKER",
      isActive:     true,
    });

    // Recalculate eligibility for all workers in parallel
    const eligibilityResults = await Promise.all(
      workers.map((worker) => calculateEligibility(worker, organization, month))
    );

    return res.json({
      success:     true,
      month,
      total:       workers.length,
      eligible:    eligibilityResults.filter((e) => e.isEligible).length,
      ineligible:  eligibilityResults.filter((e) => !e.isEligible).length,
      eligibility: eligibilityResults,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// qualifiedList
// GET /api/eligibility/qualified-list   (ADMIN)
// Returns workers who are eligible and have a verified primary bank account
// ─────────────────────────────────────────────────────────────────────────────
export const qualifiedList = async (req, res) => {
  try {
    const month        = req.query.month || getCurrentMonth();
    const organization = await Organization.findById(req.user.organization);

    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const workers = await User.find({
      organization: req.user.organization,
      role:         "WORKER",
      isActive:     true,
    });

    const eligibilityResults = await Promise.all(
      workers.map((worker) => calculateEligibility(worker, organization, month))
    );

    const eligible = eligibilityResults
      .filter((e) => e.isEligible)
      .map((e) => e.worker);

    return res.json({
      success: true,
      month,
      count:   eligible.length,
      workers: eligible,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
