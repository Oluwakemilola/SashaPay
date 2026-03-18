import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    bankName:      { type: String, required: true },
    bankCode:      { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName:   { type: String },        // resolved by Paystack
    recipientCode: { type: String },        // Paystack RCP_xxx

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "FAILED"],
      default: "PENDING",
    },
    verifiedAt:    { type: Date },
    failureReason: { type: String },

    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Fast lookup: primary verified account for a worker (used by payroll engine)
bankAccountSchema.index({ worker: 1, isPrimary: 1, verificationStatus: 1 });

const BankAccount = mongoose.model("BankAccount", bankAccountSchema);
export default BankAccount;