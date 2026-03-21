import axios from "axios";
import Organization from "../models/Organization.js";
import { MOCK_MODE } from "../services/paystack.service.js";

// ─────────────────────────────────────────────
// getSettings — GET /api/settings
// ─────────────────────────────────────────────
export const getSettings = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });

    return res.json({
      success: true,
      settings: {
        orgName:          org.name,
        orgEmail:         org.email,
        industry:         org.industry,
        payrollPolicy:    org.payrollPolicy,
        thresholdPercent: org.thresholdPercent,
        isPaymentSetup:   org.isPaymentSetup || false,
        paymentMethod:    org.paymentMethod   || "PAYSTACK",
        walletBalance:    org.walletBalance   || 0,
        totalFunded:      org.totalFunded     || 0,
        mockMode:         MOCK_MODE,
        paystackKeyHint:  org.isPaymentSetup && org.paymentMethod === "PAYSTACK" ? "sk_**********************" : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// setupPayment — POST /api/settings/payment
// Connect Paystack account
// ─────────────────────────────────────────────
export const setupPayment = async (req, res) => {
  try {
    const { paystackSecretKey } = req.body;

    if (!paystackSecretKey || paystackSecretKey.trim().length < 6) {
      return res.status(400).json({ success: false, message: "A valid Paystack secret key is required" });
    }

    const org = await Organization.findById(req.user.organization);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });

    if (MOCK_MODE || paystackSecretKey === "WALLET_MODE") {
      org.paystackSecretKey = paystackSecretKey.trim();
      org.isPaymentSetup    = true;
      org.paymentMethod     = "PAYSTACK";
      await org.save();
      return res.json({ success: true, message: "Payment account connected successfully", isPaymentSetup: true, mockMode: true });
    }

    // Production — validate with Paystack
    try {
      const testRes = await axios.get("https://api.paystack.co/balance", {
        headers: { Authorization: `Bearer ${paystackSecretKey.trim()}` },
      });
      if (!testRes.data.status) throw new Error("Invalid key");
      org.paystackSecretKey = paystackSecretKey.trim();
      org.isPaymentSetup    = true;
      org.paymentMethod     = "PAYSTACK";
      await org.save();
      return res.json({ success: true, message: "Paystack account connected and verified", isPaymentSetup: true });
    } catch {
      return res.status(400).json({ success: false, message: "Invalid Paystack secret key. Please check and try again." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// fundWallet — POST /api/settings/fund-wallet
// Admin funds the org wallet
// ─────────────────────────────────────────────
export const fundWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "A valid amount is required" });
    }

    const org = await Organization.findById(req.user.organization);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });

    const fundAmount      = Number(amount);
    org.walletBalance     = (org.walletBalance || 0) + fundAmount;
    org.totalFunded       = (org.totalFunded   || 0) + fundAmount;
    org.walletFundedAt    = new Date();
    org.isPaymentSetup    = true;
    org.paymentMethod     = "WALLET";
    await org.save();

    return res.json({
      success:       true,
      message:       `Wallet funded with ₦${fundAmount.toLocaleString()} successfully`,
      walletBalance: org.walletBalance,
      totalFunded:   org.totalFunded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────
// updatePayrollPolicy — PATCH /api/settings/payroll-policy
// ─────────────────────────────────────────────
export const updatePayrollPolicy = async (req, res) => {
  try {
    const { payrollPolicy, thresholdPercent } = req.body;
    const org = await Organization.findById(req.user.organization);
    if (!org) return res.status(404).json({ success: false, message: "Organisation not found" });

    if (payrollPolicy)    org.payrollPolicy    = payrollPolicy;
    if (thresholdPercent) org.thresholdPercent = Number(thresholdPercent);
    await org.save();

    return res.json({
      success:  true,
      message:  "Payroll policy updated",
      settings: { payrollPolicy: org.payrollPolicy, thresholdPercent: org.thresholdPercent },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
        
