import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String },

    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "WORKER"],
      default: "WORKER",
    },

    salary:     { type: Number, default: 0 },
    department: { type: String, default: "" },

    // Soft delete — never hard-delete workers; payroll history must persist
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ── Password Hashing ──────────────────────────────────────────────────────────
// Async hook — Mongoose awaits the Promise, so no next() param needed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Password Comparison ───────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Strip password from all JSON responses ────────────────────────────────────
userSchema.set("toJSON", {
  transform(doc, ret) {
    delete ret.password;
    return ret;
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);