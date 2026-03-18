import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    month:        { type: String },   // "YYYY-MM"
    amount:       { type: Number },   // in NGN
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    paidAt:       { type: Date },
  },
  { _id: false }
);

const employmentHistorySchema = new mongoose.Schema(
  {
    orgName:    { type: String },
    industry:   { type: String },
    from:       { type: Date },
    to:         { type: Date },
    avgSalary:  { type: Number },
  },
  { _id: false }
);

const financialPassportSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    totalIncome:             { type: Number, default: 0 },
    totalMonthsEmployed:     { type: Number, default: 0 },
    averageMonthlyIncome:    { type: Number, default: 0 },

    // % of months salary was paid on time (0-100)
    paymentConsistencyScore: { type: Number, default: 0 },

    // monthsPaid / monthsEmployed * 100
    incomeStabilityScore:    { type: Number, default: 0 },

    payments:          [paymentSchema],
    employmentHistory: [employmentHistorySchema],
    generatedAt:       { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("FinancialPassport", financialPassportSchema);
