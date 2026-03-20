import Attendance from "../models/Attendance.js";
import Eligibility from "../models/Eligibility.js";
import Transfer from "../models/Transfer.js";
import FinancialPassport from "../models/FinancialPassport.js";
import Organization from "../models/Organization.js";
import axios from "axios";
import { CLAUDE_API_KEY, GROQ_API_KEY } from "../config/env.js";
import { getCurrentMonth } from "../utils/eligibility.util.js";

// ─────────────────────────────────────────────
// chat
// POST /api/agent/chat
// ─────────────────────────────────────────────
export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const month     = getCurrentMonth();
    const workerId  = req.user._id;
    const orgId     = req.user.organization;
    const firstName = req.user.name?.split(" ")[0] || "there";

    const [organization, eligibility, recentAttendance, lastTransfer] = await Promise.all([
      Organization.findById(orgId, "name payrollPolicy thresholdPercent totalWorkDays"),
      Eligibility.findOne({ worker: workerId, month }),
      Attendance.find({ worker: workerId, organization: orgId })
        .sort({ date: -1 })
        .limit(10)
        .select("date status checkIn checkOut hoursWorked lateMinutes"),
      Transfer.findOne({ worker: workerId, status: "SUCCESS" })
        .sort({ paidAt: -1 })
        .select("amountKobo month paidAt"),
    ]);

    const attendanceSummary = recentAttendance.map((a) => ({
      date:   a.date.toISOString().split("T")[0],
      status: a.status,
      hours:  a.hoursWorked,
    }));

    const systemContext = `
You are a warm, friendly HR assistant for SachaPay, a payroll platform for Nigerian SMEs.
You are speaking with ${req.user.name}, a worker at ${organization?.name || "their organisation"}.

Always address them by their first name "${firstName}" naturally in your responses.
Be conversational, empathetic and helpful — not robotic or overly formal.
If they raise a complaint or concern, acknowledge their feelings first before explaining.
Keep responses to 2-4 sentences unless more detail is genuinely needed.
Use ₦ for naira amounts. Respond in plain text, no markdown.

Current month: ${month}
Salary: ₦${(req.user.salary || 0).toLocaleString()}
Payroll policy: ${organization?.payrollPolicy || "FIXED_SALARY"}
${organization?.payrollPolicy === "ATTENDANCE_BASED"
  ? `Attendance threshold to qualify for salary: ${organization.thresholdPercent}%`
  : "All active workers receive their fixed salary each month."}

Eligibility this month:
${eligibility
  ? `- Days attended: ${eligibility.daysAttended}/${eligibility.workingDaysElapsed}
- Attendance: ${eligibility.attendancePercent}%
- Eligible for payroll: ${eligibility.isEligible ? "YES ✅" : "NO ❌"}`
  : "- Eligibility not yet calculated for this month."}

Last 10 attendance records:
${JSON.stringify(attendanceSummary, null, 2)}

Last salary payment:
${lastTransfer
  ? `₦${Math.round(lastTransfer.amountKobo / 100).toLocaleString()} for ${lastTransfer.month} (paid ${lastTransfer.paidAt?.toISOString().split("T")[0]})`
  : "No salary payments on record yet."}
`.trim();

    let reply = "";

    if (GROQ_API_KEY) {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemContext },
            { role: "user",   content: message },
          ],
          max_tokens: 512,
        },
        {
          headers: {
            Authorization:  `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ).catch(err => {
        console.error("Groq API Error:", err.response?.data || err.message);
        throw err;
      });
      reply = response.data.choices?.[0]?.message?.content
        || `Sorry ${firstName}, I couldn't generate a response right now.`;

    } else if (CLAUDE_API_KEY && CLAUDE_API_KEY !== "your_api_key_here") {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model:      "claude-3-5-haiku-20241022",
          max_tokens: 512,
          system:     systemContext,
          messages:   [{ role: "user", content: message }],
        },
        {
          headers: {
            "x-api-key":         CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type":      "application/json",
          },
        }
      );
      reply = response.data.content?.[0]?.text
        || `Sorry ${firstName}, I couldn't generate a response right now.`;

    } else {
      // Demo fallback — no API key needed
      const attPercent = eligibility?.attendancePercent || 0;
      const isEligible = eligibility?.isEligible;
      reply = `Hi ${firstName}! I'm your SachaPay assistant. Your attendance this month is ${attPercent}%. ${isEligible ? "Great news — you're eligible for payroll this month! ✅" : "Unfortunately your attendance is below the required threshold for this month's payroll. ❌"} Your last payment was ${lastTransfer ? `for ${lastTransfer.month}` : "not yet recorded"}. Feel free to ask me anything else!`;
    }

    return res.json({ success: true, reply });

  } catch (error) {
    console.error("AI Agent error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "AI agent is temporarily unavailable",
    });
  }
};

// ─────────────────────────────────────────────
// history — placeholder
// ─────────────────────────────────────────────
export const history = async (req, res) => {
  return res.json({
    success: true,
    message: "Chat history persistence coming soon",
    history: [],
  });
};
