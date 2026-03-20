import axios from "axios";
import crypto from "crypto";
import { PAYSTACK_SECRET_KEY } from "../config/env.js";

// ─────────────────────────────────────────────
// MOCK_MODE — true when no Paystack key is set
// Controllers import this to skip real API calls
// ─────────────────────────────────────────────
export const MOCK_MODE = !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY === "your_paystack_key_here";

if (MOCK_MODE) {
  console.log("🟡 Paystack running in MOCK MODE — no real transfers will be made");
}

const paystackAPI = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// ── 1. Verify Bank Account ────────────────────────────────────────────────────
export const verifyBankAccount = async (accountNumber, bankCode) => {
  if (MOCK_MODE) {
    return { account_number: accountNumber, account_name: "MOCK ACCOUNT NAME", bank_id: bankCode };
  }
  const { data } = await paystackAPI.get("/bank/resolve", {
    params: { account_number: accountNumber, bank_code: bankCode },
  });
  return data.data;
};

// ── 2. Create Transfer Recipient ──────────────────────────────────────────────
export const createTransferRecipient = async (name, accountNumber, bankCode) => {
  if (MOCK_MODE) {
    return { recipient_code: `MOCK_RCP_${Date.now()}`, id: Date.now() };
  }
  const { data } = await paystackAPI.post("/transferrecipient", {
    type: "nuban", name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency: "NGN",
  });
  return data.data;
};

// ── 3. Bulk Transfer ──────────────────────────────────────────────────────────
export const bulkTransfer = async (transfers) => {
  if (MOCK_MODE) {
    console.log(`🟡 MOCK: simulating bulk transfer for ${transfers.length} workers`);
    return transfers.map((t) => ({ ...t, status: "success", transfer_code: `MOCK_TRF_${Date.now()}` }));
  }
  const { data } = await paystackAPI.post("/transfer/bulk", {
    currency: "NGN", source: "balance", transfers,
  });
  return data.data;
};

// ── 4. Webhook Signature Verification ────────────────────────────────────────
export const verifyWebhookSignature = (rawBody, signature) => {
  if (MOCK_MODE) return true;
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
};
