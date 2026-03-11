import mongoose from "mongoose";

const payrollRunSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    // Format: "YYYY-MM"
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },

    totalWorkers:    { type: Number, default: 0 },
    eligibleWorkers: { type: Number, default: 0 },
    totalAmount:     { type: Number, default: 0 }, // in NGN kobo

    status: {
      type: String,
      enum: ["DRAFT", "APPROVED", "DISBURSING", "COMPLETED", "PARTIAL_FAILURE"],
      default: "DRAFT",
    },

    approvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt:  { type: Date },
    disbursedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Only one payroll run per org per month
payrollRunSchema.index({ organization: 1, month: 1 }, { unique: true });

export default mongoose.model("PayrollRun", payrollRunSchema);
