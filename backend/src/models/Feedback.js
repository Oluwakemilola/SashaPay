import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role:         { type: String, enum: ["ADMIN", "MANAGER", "WORKER"], required: true },

    // PAYROLL_RUN -> contextId is the PayrollRun _id; PAYMENT -> contextId is the "YYYY-MM" month
    contextType:  { type: String, enum: ["PAYROLL_RUN", "PAYMENT"], required: true },
    contextId:    { type: String, required: true },

    rating:  { type: Number, min: 1, max: 5, required: true },
    message: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

feedbackSchema.index({ user: 1, contextType: 1, contextId: 1 }, { unique: true });

export default mongoose.model("Feedback", feedbackSchema);
