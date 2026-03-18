import mongoose from "mongoose";

const transferSchema = new mongoose.Schema(
  {
    payrollRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },

    // Format: "YYYY-MM"
    month: { type: String },

    amountKobo:    { type: Number, required: true }, // amount in kobo
    recipientCode: { type: String },                 // Paystack RCP_xxx

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "RETRYING"],
      default: "PENDING",
    },

    paystackReference: { type: String },
    failureReason:     { type: String },
    paidAt:            { type: Date },
  },
  { timestamps: true }
);

// Fast lookup: all transfers for a payroll run
transferSchema.index({ payrollRun: 1, status: 1 });
// One transfer per worker per payroll run
transferSchema.index({ payrollRun: 1, worker: 1 }, { unique: true });

export default mongoose.model("Transfer", transferSchema);
