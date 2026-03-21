import BankAccount from "../models/BankAccount.js";
import User from "../models/User.js";
import {
  verifyBankAccount,
  createTransferRecipient,
  MOCK_MODE,
} from "../services/paystack.service.js";

// ─────────────────────────────────────────────
// addBankAccount — POST /api/bank
// ─────────────────────────────────────────────
export const addBankAccount = async (req, res) => {
  try {
    const { bankName, bankCode, accountNumber } = req.body;

    if (!bankName || !bankCode || !accountNumber) {
      return res.status(400).json({
        success: false,
        message: "bankName, bankCode, and accountNumber are required.",
      });
    }

    // Block duplicates
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

    let accountName   = req.user.name.toUpperCase();
    let recipientCode = `MOCK_RCP_${req.user._id.toString().slice(-6)}`;
    let verified      = true;

    if (!MOCK_MODE) {
      // ── LIVE / TEST MODE: call real Paystack ──
      try {
        // Step 1 — verify account number exists
        const verification = await verifyBankAccount(accountNumber, bankCode);
        accountName = verification.account_name;

        // Step 2 — create transfer recipient to get recipient_code
        const recipient = await createTransferRecipient(
          accountName,
          accountNumber,
          bankCode
        );
        recipientCode = recipient.recipient_code;
        verified      = true;

        console.log(`✅ Bank verified: ${accountName} — ${recipientCode}`);
      } catch (paystackError) {
        console.error("Paystack verification error:", paystackError.message);
        return res.status(400).json({
          success: false,
          message: "Could not verify bank account. Please check your account number and bank, then try again.",
        });
      }
    }

    // First account → make primary automatically
    const existingCount = await BankAccount.countDocuments({ worker: req.user._id });
    const isPrimary     = existingCount === 0;

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

    return res.status(201).json({
      success: true,
      message: `Account verified — ${accountName} at ${bankName}.${isPrimary ? " Set as primary account." : ""}`,
      account,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// getMyAccounts — GET /api/bank
// ─────────────────────────────────────────────
export const getMyAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ worker: req.user._id })
      .sort({ isPrimary: -1, createdAt: 1 });
    return res.json({ success: true, count: accounts.length, accounts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// setPrimary — PATCH /api/bank/:id/set-primary
// ─────────────────────────────────────────────
export const setPrimary = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id, worker: req.user._id,
    });
    if (!account) return res.status(404).json({ success: false, message: "Account not found." });
    if (account.verificationStatus !== "VERIFIED") return res.status(400).json({ success: false, message: "Only verified accounts can be set as primary." });
    if (account.isPrimary) return res.status(400).json({ success: false, message: "This account is already your primary account." });

    await BankAccount.updateMany({ worker: req.user._id, isPrimary: true }, { isPrimary: false });
    account.isPrimary = true;
    await account.save();

    return res.json({ success: true, message: `${account.bankName} — ${account.accountNumber} is now your primary account.`, account });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// deleteAccount — DELETE /api/bank/:id
// ─────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    const account = await BankAccount.findOne({
      _id: req.params.id, worker: req.user._id,
    });
    if (!account) return res.status(404).json({ success: false, message: "Account not found." });
    if (account.isPrimary) {
      const total = await BankAccount.countDocuments({ worker: req.user._id });
      if (total === 1) return res.status(400).json({ success: false, message: "Cannot delete your only bank account. Add another first." });
      return res.status(400).json({ success: false, message: "Cannot delete your primary account. Set another as primary first." });
    }
    await account.deleteOne();
    return res.json({ success: true, message: "Bank account removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// getStaffAccounts — GET /api/bank/staff/:userId (Admin)
// ─────────────────────────────────────────────
export const getStaffAccounts = async (req, res) => {
  try {
    const targetUser = await User.findOne({
      _id: req.params.userId, organization: req.user.organization,
    });
    if (!targetUser) return res.status(404).json({ success: false, message: "Staff member not found." });

    const accounts = await BankAccount.find({ worker: req.params.userId })
      .sort({ isPrimary: -1, createdAt: 1 });

    return res.json({
      success: true,
      user: { id: targetUser._id, name: targetUser.name, department: targetUser.department },
      count: accounts.length,
      accounts,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
                                 
