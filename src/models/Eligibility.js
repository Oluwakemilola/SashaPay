import mongoose from "mongoose";

const eligibilitySchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    // Format: "YYYY-MM"  e.g. "2025-03"
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },

    daysAttended:         { type: Number, default: 0 },
    workingDaysElapsed:   { type: Number, default: 0 },
    attendancePercent:    { type: Number, default: 0 },
    isEligible:           { type: Boolean, default: false },
    calculatedAt:         { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One eligibility record per worker per month
eligibilitySchema.index({ worker: 1, month: 1 }, { unique: true });
eligibilitySchema.index({ organization: 1, month: 1 });

export default mongoose.model("Eligibility", eligibilitySchema);
