import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, trim: true },
    industry:  { type: String, default: "General" },
    inviteCode:        { type: String, unique: true, sparse: true },
    inviteCodeExpires: { type: Date },
    payrollPolicy:     { type: String, enum: ["FIXED_SALARY", "ATTENDANCE_BASED"], default: "FIXED_SALARY" },
    thresholdPercent:  { type: Number, default: 80 },
    totalWorkDays:     { type: Number, default: 22 },

    // ── Payment Setup ──
    isPaymentSetup:    { type: Boolean, default: false },
    paymentMethod:     { type: String, enum: ["PAYSTACK", "WALLET"], default: "PAYSTACK" },
    paystackSecretKey: { type: String, default: null, select: false },

    // ── Wallet ──
    walletBalance:     { type: Number, default: 0 },
    walletFundedAt:    { type: Date },
    totalFunded:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Generate invite code on create
organizationSchema.pre("save", function () {
  if (!this.inviteCode) {
    this.inviteCode        = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.inviteCodeExpires = new Date(Date.now() + 30 * 60 * 1000);
  }
});

export default mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);
