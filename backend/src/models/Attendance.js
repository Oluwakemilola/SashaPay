import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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

    date: {
      type: Date,
      required: true,
    },

    checkIn:  { type: Date },
    checkOut: { type: Date },

    hoursWorked: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["PRESENT", "LATE", "ABSENT"],
      default: "PRESENT",
    },

    lateMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One record per worker per day
attendanceSchema.index({ worker: 1, date: 1 }, { unique: true });

// Fast org-level queries (e.g. org summary for a date range)
attendanceSchema.index({ organization: 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);
