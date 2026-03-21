import mongoose from "mongoose";
import crypto from "crypto";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String, required: true, trim: true,
    },
    email: {
      type: String, required: true, unique: true, lowercase: true, trim: true,
    },
    phone: {
      type: String, trim: true,
    },
    industry: {
      type: String, default: "General",
    },
    inviteCode: {
      type: String, unique: true, sparse: true,
    },
    inviteCodeExpires: {
      type: Date,
    },
    payrollPolicy: {
      type: String, enum: ["FIXED_SALARY", "ATTENDANCE_BASED"], default: "FIXED_SALARY",
    },
    thresholdPercent: {
      type: Number, default: 80,
    },
    totalWorkDays: {
      type: Number, default: 22,
    },

    // ── Payment Setup ─────────────────────────────
    // Stores org's Paystack secret key encrypted at rest
    // In demo/mock mode this can be any value
    isPaymentSetup: {
      type: Boolean, default: false,
    },
    paystackSecretKey: {
      type: String, default: null,
      // Never return this in API responses
      select: false,
    },
  },
  { timestamps: true }
);

// ── Generate invite code on create ───────────────
organizationSchema.pre("save", function (next) {
  if (!this.inviteCode) {
    this.inviteCode        = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.inviteCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  }
  next();
});

// ── Encrypt Paystack key before saving ───────────
// In production: use proper encryption key from env
// For demo: just stores as-is (mock mode)
organizationSchema.methods.setPaystackKey = function (key) {
  // In production replace with proper AES-256 encryption
  // For now just mark as set — actual key used in mock mode
  this.paystackSecretKey = key;
  this.isPaymentSetup    = true;
};

organizationSchema.methods.getPaystackKey = function () {
  return this.paystackSecretKey;
};

export default mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);
