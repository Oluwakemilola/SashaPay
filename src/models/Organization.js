import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      required: true,
      default: "General",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone:   { type: String },
    address: { type: String },

    inviteCode: {
      type: String,
      unique: true,
      uppercase: true,
    },

    inviteCodeExpires: {
      type: Date,
    },

    // ── Payroll Policy ────────────────────────────────────────────────────────
    payrollPolicy: {
      type: String,
      enum: ["ATTENDANCE_BASED", "FIXED_SALARY"],
      default: "FIXED_SALARY",
    },

    // Only relevant when payrollPolicy === "ATTENDANCE_BASED"
    // Worker must meet this % attendance to be eligible for salary
    thresholdPercent: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    // Total expected working days in a month (used for attendance % calc)
    totalWorkDays: {
      type: Number,
      default: 22,
    },
  },
  { timestamps: true }
);

// ── Invite Code Generation ────────────────────────────────────────────────────
// 6 uppercase alphanumeric characters per spec
function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Async hook — no next() param needed; Mongoose awaits the returned Promise
organizationSchema.pre("save", async function () {
  if (!this.inviteCode) {
    let attempts = 0;
    while (attempts < 5) {
      const code = generateInviteCode();
      const exists = await mongoose.models.Organization.findOne({ inviteCode: code });
      if (!exists) {
        this.inviteCode = code;
        this.inviteCodeExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now
        break;
      }
      attempts++;
    }
    if (!this.inviteCode) {
      throw new Error("Failed to generate a unique invite code. Please try again.");
    }
  }
});

export default mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);