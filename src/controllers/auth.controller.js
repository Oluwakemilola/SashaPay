import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

import User from "../models/User.js";
import Organization from "../models/Organization.js";



// ─────────────────────────────────────────────
// Helper: Generate JWT
// ─────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};



// ─────────────────────────────────────────────
// registerOrg
// POST /api/auth/register-org
// Creates organization + first admin
// ─────────────────────────────────────────────
export const registerOrg = async (req, res) => {

  let createdOrg = null;

  try {

    const {
      orgName,
      industry,
      orgEmail,
      orgPhone,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;



    // ── Validation ────────────────────────────
    if (
      !orgName ||
      !orgEmail ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "orgName, orgEmail, adminName, adminEmail and adminPassword are required"
      });
    }



    // ── Check duplicates ─────────────────────
    const existingOrg = await Organization.findOne({ email: orgEmail });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: "An organization with this email already exists"
      });
    }

    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists"
      });
    }



    // ── Create Organization ──────────────────
    createdOrg = await Organization.create({
      name: orgName,
      industry: industry || "General",
      email: orgEmail,
      phone: orgPhone
    });



    // ── Create Admin User ────────────────────
    const adminUser = await User.create({
      organization: createdOrg._id,
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN"
    });



    // ── Generate Token ───────────────────────
    const token = signToken(adminUser._id);



    return res.status(201).json({
      success: true,
      message: "Organization created successfully",
      token,
      user: adminUser,
      organization: createdOrg,
      inviteCode: createdOrg.inviteCode
    });

  } catch (error) {

    // Rollback if org created but admin failed
    if (createdOrg) {
      await Organization.findByIdAndDelete(createdOrg._id);
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ─────────────────────────────────────────────
// registerStaff
// POST /api/auth/register
// Staff joins with invite code
// ─────────────────────────────────────────────
export const registerStaff = async (req, res) => {

  try {

    const { name, email, password, inviteCode } = req.body;



    if (!name || !email || !password || !inviteCode) {
      return res.status(400).json({
        success: false,
        message:
          "name, email, password and inviteCode are required"
      });
    }



    // ── Find organization ────────────────────
    const organization = await Organization.findOne({
      inviteCode: inviteCode.toUpperCase()
    });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite code"
      });
    }

    // ── Check if invite code has expired ─────
    if (organization.inviteCodeExpires && organization.inviteCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This invite code has expired. Please ask your administrator to generate a new one."
      });
    }



    // ── Check if user exists ─────────────────
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered"
      });
    }



    // ── Create staff user ────────────────────
    const user = await User.create({
      organization: organization._id,
      name,
      email,
      password,
      role: "WORKER"
    });



    const token = signToken(user._id);



    return res.status(201).json({
      success: true,
      message: `Welcome to ${organization.name}`,
      token,
      user,
      organization
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ─────────────────────────────────────────────
// login
// POST /api/auth/login
// ─────────────────────────────────────────────
export const login = async (req, res) => {

  try {

    const { email, password } = req.body;



    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }



    const user = await User.findOne({ email });



    // Avoid revealing which field failed
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }



    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated"
      });
    }



    const organization = await Organization.findById(
      user.organization
    );



    const token = signToken(user._id);



    return res.json({
      success: true,
      token,
      user,
      organization
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// ─────────────────────────────────────────────
// getMe
// GET /api/auth/me
// Returns logged-in user
// ─────────────────────────────────────────────
export const getMe = async (req, res) => {

  try {

    const organization = await Organization.findById(
      req.user.organization
    );



    return res.json({
      success: true,
      user: req.user,
      organization
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─────────────────────────────────────────────
// refreshInvite
// POST /api/auth/refresh-invite
// Admin generates a new invite code with a fresh 30 min expiry
// ─────────────────────────────────────────────
export const refreshInvite = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    
    // Setting to undefined will trigger the pre-save hook to generate a new code and expiry
    organization.inviteCode = undefined;
    await organization.save();

    return res.json({
      success: true,
      message: "New invite code generated successfully (valid for 30 minutes).",
      inviteCode: organization.inviteCode,
      expiresAt: organization.inviteCodeExpires,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};