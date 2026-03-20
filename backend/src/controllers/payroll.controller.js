import mongoose from "mongoose";
import crypto from "crypto";

import User from "../models/User.js";
import Organization from "../models/Organization.js";
import BankAccount from "../models/BankAccount.js";
import PayrollRun from "../models/PayrollRun.js";
import Transfer from "../models/Transfer.js";
import FinancialPassport from "../models/FinancialPassport.js";
import Eligibility from "../models/Eligibility.js";

import { calculateEligibility, getCurrentMonth } from "../utils/eligibility.util.js";
import { bulkTransfer, verifyWebhookSignature, MOCK_MODE } from "../services/paystack.service.js";
import { PAYSTACK_SECRET_KEY } from "../config/env.js";

// ─────────────────────────────────────────────
// rebuildFinancialPassport
// ─────────────────────────────────────────────
const rebuildFinancialPassport = async (workerId) => {
  const successfulTransfers = await Transfer.find({ worker: workerId, status: "SUCCESS" })
    .populate("organization", "name industry")
    .sort({ paidAt: 1 });

  if (successfulTransfers.length === 0) return;

  const totalIncome          = successfulTransfers.reduce((sum, t) => sum + Math.round(t.amountKobo / 100), 0);
  const totalMonthsPaid      = successfulTransfers.length;
  const averageMonthlyIncome = Math.round(totalIncome / totalMonthsPaid);

  const firstPaid      = successfulTransfers[0].paidAt;
  const lastPaid       = successfulTransfers[totalMonthsPaid - 1].paidAt;
  const monthsEmployed = (lastPaid.getFullYear() - firstPaid.getFullYear()) * 12 +
    (lastPaid.getMonth() - firstPaid.getMonth()) + 1;

  const paymentConsistencyScore = Math.min(100, Math.round((totalMonthsPaid / monthsEmployed) * 100));
  const incomeStabilityScore    = paymentConsistencyScore;

  const payments = successfulTransfers.map((t) => ({
    month:        t.month,
    amount:       Math.round(t.amountKobo / 100),
    organization: t.organization?._id,
    paidAt:       t.paidAt,
  }));

  const orgMap = {};
  successfulTransfers.forEach((t) => {
    const key = t.organization?._id?.toString();
    if (!key) return;
    if (!orgMap[key]) orgMap[key] = { orgName: t.organization.name, industry: t.organization.industry, from: t.paidAt, to: t.paidAt, amounts: [] };
    orgMap[key].to = t.paidAt;
    orgMap[key].amounts.push(Math.round(t.amountKobo / 100));
  });

  const employmentHistory = Object.values(orgMap).map((e) => ({
    orgName:   e.orgName,
    industry:  e.industry,
    from:      e.from,
    to:        e.to,
    avgSalary: Math.round(e.amounts.reduce((s, a) => s + a, 0) / e.amounts.length),
  }));

  await FinancialPassport.findOneAndUpdate(
    { worker: workerId },
    { worker: workerId, totalIncome, totalMonthsEmployed: monthsEmployed, averageMonthlyIncome, paymentConsistencyScore, incomeStabilityScore, payments, employmentHistory, generatedAt: new Date() },
    { upsert: true, returnDocument: "after" }
  );
};

// ─────────────────────────────────────────────
// createRun — POST /api/payroll/run
// ─────────────────────────────────────────────
export const createRun = async (req, res) => {
  try {
    const { month } = req.body;
    const orgId     = req.user.organization;

    const organization = await Organization.findById(orgId);
    if (!organization) return res.status(404).json({ success: false, message: "Organization not found" });

    const existing = await PayrollRun.findOne({ organization: orgId, month });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A payroll run for ${month} already exists (status: ${existing.status})`,
        payrollRun: existing,
      });
    }

    const workers            = await User.find({ organization: orgId, role: "WORKER", isActive: true });
    const eligibilityResults = await Promise.all(workers.map((w) => calculateEligibility(w, organization, month)));
    const eligibleWorkers    = workers.filter((_, i) => eligibilityResults[i].isEligible);

    // ── MOCK MODE: accept any bank account (not just VERIFIED)
    // ── LIVE MODE: require verified primary account
    const eligibleWithBank = [];
    for (const worker of eligibleWorkers) {
      const account = await BankAccount.findOne({
        worker:    worker._id,
        isPrimary: true,
        ...(MOCK_MODE ? {} : { verificationStatus: "VERIFIED" }),
      });
      if (account) eligibleWithBank.push({ worker, account });
    }

    const totalAmount = eligibleWithBank.reduce((sum, { worker }) => sum + (worker.salary || 0) * 100, 0);

    const payrollRun = await PayrollRun.create({
      organization: orgId, month,
      totalWorkers: workers.length,
      eligibleWorkers: eligibleWithBank.length,
      totalAmount, status: "DRAFT",
    });

    await Promise.all(
      eligibleWithBank.map(({ worker, account }) =>
        Transfer.create({
          payrollRun:    payrollRun._id,
          worker:        worker._id,
          organization:  orgId,
          month,
          amountKobo:    (worker.salary || 0) * 100,
          recipientCode: account.recipientCode || `MOCK-${account._id}`,
          status:        "PENDING",
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Payroll run created for ${month}. ${eligibleWithBank.length} workers eligible.`,
      payrollRun,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// approveRun — PATCH /api/payroll/:id/approve
// ─────────────────────────────────────────────
export const approveRun = async (req, res) => {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });
    if (run.status !== "DRAFT") return res.status(400).json({ success: false, message: `Cannot approve a run with status: ${run.status}` });

    run.status = "APPROVED"; run.approvedBy = req.user._id; run.approvedAt = new Date();
    await run.save();
    return res.json({ success: true, message: "Payroll run approved", payrollRun: run });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// disburseRun — POST /api/payroll/:id/disburse
// ─────────────────────────────────────────────
export const disburseRun = async (req, res) => {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });
    if (run.status !== "APPROVED") return res.status(400).json({ success: false, message: "Payroll must be APPROVED before disbursement" });

    const pendingTransfers = await Transfer.find({ payrollRun: run._id, status: "PENDING" });
    if (pendingTransfers.length === 0) return res.status(400).json({ success: false, message: "No pending transfers found" });

    const payload = pendingTransfers.map((t) => ({
      amount:    t.amountKobo,
      recipient: t.recipientCode,
      reference: `SACHAPAY-${run._id}-${t._id}`,
      reason:    `Salary for ${run.month}`,
    }));

    // Update references
    await Promise.all(pendingTransfers.map((t, i) =>
      Transfer.findByIdAndUpdate(t._id, { paystackReference: payload[i].reference, status: "RETRYING" })
    ));

    // Call Paystack (or mock)
    await bulkTransfer(payload);

    // ── MOCK MODE: immediately mark all SUCCESS and rebuild passports ──
    if (MOCK_MODE) {
      console.log("🟡 MOCK MODE: marking all transfers as SUCCESS");
      const now = new Date();

      await Promise.all(pendingTransfers.map((t) =>
        Transfer.findByIdAndUpdate(t._id, { status: "SUCCESS", paidAt: now }, { returnDocument: "after" })
      ));

      // Rebuild passport for every worker who was paid
      await Promise.all(pendingTransfers.map((t) => rebuildFinancialPassport(t.worker)));

      run.status      = "COMPLETED";
      run.completedAt = now;
      run.disbursedAt = now;
      await run.save();

      return res.json({
        success: true,
        message: `✅ ${pendingTransfers.length} workers paid successfully (mock mode)`,
        payrollRun: run,
      });
    }

    // Live mode — Paystack webhook will handle status updates
    run.status      = "DISBURSING";
    run.disbursedAt = new Date();
    await run.save();

    return res.json({
      success: true,
      message: `Bulk transfer initiated for ${pendingTransfers.length} workers`,
      payrollRun: run,
    });
  } catch (error) {
    console.error("Disburse error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// retryFailed — POST /api/payroll/:id/retry-failed
// ─────────────────────────────────────────────
export const retryFailed = async (req, res) => {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });

    const failedTransfers = await Transfer.find({ payrollRun: run._id, status: "FAILED" });
    if (failedTransfers.length === 0) return res.status(400).json({ success: false, message: "No failed transfers to retry" });

    const payload = failedTransfers.map((t) => ({
      amount: t.amountKobo, recipient: t.recipientCode,
      reference: `SACHAPAY-RETRY-${Date.now()}-${t._id}`,
      reason: `Salary retry for ${run.month}`,
    }));

    await Promise.all(failedTransfers.map((t, i) =>
      Transfer.findByIdAndUpdate(t._id, { paystackReference: payload[i].reference, status: "RETRYING", failureReason: null })
    ));

    await bulkTransfer(payload);
    return res.json({ success: true, message: `Retrying ${failedTransfers.length} failed transfers` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// webhook — POST /api/payroll/webhook
// ─────────────────────────────────────────────
export const webhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!verifyWebhookSignature(req.rawBody, signature)) return res.status(401).json({ success: false, message: "Invalid webhook signature" });

    const event = req.body;
    if (event.event === "transfer.success" || event.event === "transfer.failed") {
      const { reference, status: paystackStatus } = event.data;
      const transfer = await Transfer.findOne({ paystackReference: reference });
      if (!transfer) return res.sendStatus(200);

      const newStatus        = paystackStatus === "success" ? "SUCCESS" : "FAILED";
      transfer.status        = newStatus;
      transfer.failureReason = paystackStatus !== "success" ? event.data.reason : null;
      transfer.paidAt        = paystackStatus === "success" ? new Date() : null;
      await transfer.save();

      if (newStatus === "SUCCESS") await rebuildFinancialPassport(transfer.worker);

      const run = await PayrollRun.findById(transfer.payrollRun);
      if (run) {
        const allTransfers = await Transfer.find({ payrollRun: run._id });
        const allDone      = allTransfers.every((t) => ["SUCCESS", "FAILED"].includes(t.status));
        if (allDone) {
          run.status      = allTransfers.some((t) => t.status === "FAILED") ? "PARTIAL_FAILURE" : "COMPLETED";
          run.completedAt = new Date();
          await run.save();
        }
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.sendStatus(500);
  }
};

// ─────────────────────────────────────────────
// history — GET /api/payroll/history
// ─────────────────────────────────────────────
export const history = async (req, res) => {
  try {
    const runs = await PayrollRun.find({ organization: req.user.organization })
      .sort({ createdAt: -1 }).populate("approvedBy", "name email");
    return res.json({ success: true, count: runs.length, payrollRuns: runs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// getOne — GET /api/payroll/:id
// ─────────────────────────────────────────────
export const getOne = async (req, res) => {
  try {
    const run = await PayrollRun.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate("approvedBy", "name email");
    if (!run) return res.status(404).json({ success: false, message: "Payroll run not found" });

    const transfers = await Transfer.find({ payrollRun: run._id }).populate("worker", "name email department salary");
    return res.json({ success: true, payrollRun: run, transfers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
  
