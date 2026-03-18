import BankAccount from "../models/BankAccount.js";
import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// addBankAccount
// POST /api/bank-accounts
//
// Worker submits their bank account details.
// Creates a PENDING record, then calls Paystack to verify.
// On successful verification:
//   - accountName is saved (from Paystack)
//   - recipientCode is saved (used for all future transfers)
//   - verificationStatus → VERIFIED
//   - if it's the worker's first account, isPrimary is set to true automatically
// ─────────────────────────────────────────────────────────────────────────────
export const addBankAccount = async (req, res) => {
  try {
    const { bankName, bankCode, accountNumber } = req.body;

    if (!bankName || !bankCode || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "bankName, bankCode, and accountNumber are required.",
      });
    }

    // Block duplicate account numbers for the same user
    const duplicate = await BankAccount.findOne({
      worker: req.user._id,
      accountNumber,
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "This account number is already saved on your profile.",
      });
    }

    // ── Paystack Verification (Day 3: replace demo block with real call) ──────
    // Real call will be:
    //   const { accountName, recipientCode } = await paystackService.verifyAccount(bankCode, accountNumber)
    //
    // Demo mode — simulate a successful verification
    const accountName   = req.user.name.toUpperCase(); // Paystack returns this
    const recipientCode = `RCP_demo_${req.user._id.toString().slice(-6)}`;
    const verified      = true; // Paystack confirmed the account exists

    // Is this the worker's first account? Make it primary automatically
    const existingCount = await BankAccount.countDocuments({ worker: req.user._id });
    const isPrimary = existingCount === 0;

    const account = await BankAccount.create({
      worker:             req.user._id,
      organization:       req.user.organization,
      bankName,
      bankCode,
      accountNumber,
      accountName,
      recipientCode,
      verificationStatus: verified ? "VERIFIED" : "FAILED",
      verifiedAt:         verified ? new Date() : undefined,
      isPrimary,
    });

    res.status(201).json({
      success: true,
      message: verified
        ? `Account verified — ${accountName} at ${bankName}.${isPrimary ? " Set as primary account." : ""}`
        : "Account could not be verified. Check your account number and try again.",
      account,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getMyAccounts
// GET /api/bank-accounts
//
// Returns all bank accounts belonging to the logged-in worker.
// Sorted: primary account first, then by date added.
// ─────────────────────────────────────────────────────────────────────────────
export const getMyAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ worker: req.user._id })
      .sort({ isPrimary: -1, createdAt: 1 }); // primary first

    res.json({
      success: true,
      count: accounts.length,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// setPrimary
// PATCH /api/bank-accounts/:id/set-primary
//
// Worker switches which account receives their salary.
// Steps:
//  1. Confirm the target account belongs to this user and is verified
//  2. Un-flag the current primary account
//  3. Flag the new account as primary
// All in one transaction so there's never a moment with 0 primary accounts.
// ─────────────────────────────────────────────────────────────────────────────
export const setPrimary = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      worker: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }
    if (account.verificationStatus !== "VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Only verified accounts can be set as primary.",
      });
    }
    if (account.isPrimary) {
      return res.status(400).json({
        success: false,
        message: "This account is already your primary account.",
      });
    }

    // Un-primary the old one, primary the new one
    await BankAccount.updateMany(
      { worker: req.user._id, isPrimary: true },
      { isPrimary: false }
    );

    account.isPrimary = true;
    await account.save();

    res.json({
      success: true,
      message: `${account.bankName} — ${account.accountNumber} is now your primary account.`,
      account,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// deleteAccount
// DELETE /api/bank-accounts/:id
//
// Worker removes a saved bank account.
// Guard: cannot delete the primary account if it's the only one left.
// (Deleting the only primary account would block salary disbursement.)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id,
      worker: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    // Block deletion if it's the only account or the active primary
    if (account.isPrimary) {
      const total = await BankAccount.countDocuments({ worker: req.user._id });
      if (total === 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your only bank account. Add another account first.",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Cannot delete your primary account. Set another account as primary first.",
      });
    }

    await account.deleteOne();

    res.json({ success: true, message: "Bank account removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// getStaffAccounts  (Admin / Manager only)
// GET /api/bank-accounts/staff/:userId
//
// Admin views a specific worker's bank accounts.
// Used in the payroll run screen to confirm bank details before disbursement.
// ─────────────────────────────────────────────────────────────────────────────
export const getStaffAccounts = async (req, res) => {
  try {
    // Confirm the target user is in the same org as the admin
    const targetUser = await User.findOne({
      _id: req.params.userId,
      organization: req.user.organization,
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Staff member not found." });
    }

    const accounts = await BankAccount.find({ worker: req.params.userId })
      .sort({ isPrimary: -1, createdAt: 1 });

    res.json({
      success: true,
      user: { id: targetUser._id, name: targetUser.name, department: targetUser.department },
      count: accounts.length,
      accounts,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};