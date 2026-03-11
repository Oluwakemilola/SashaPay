import axios from "axios";
import crypto from "crypto";
import { PAYSTACK_SECRET_KEY } from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
// Paystack Service
//
// ALL communication with Paystack lives here.
// Never import axios or call Paystack directly from controllers.
// ─────────────────────────────────────────────────────────────────────────────

const paystackAPI = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// ── 1. Verify Bank Account ────────────────────────────────────────────────────
// Resolves account name from account number + bank code via Paystack
export const verifyBankAccount = async (accountNumber, bankCode) => {
  const { data } = await paystackAPI.get("/bank/resolve", {
    params: { account_number: accountNumber, bank_code: bankCode },
  });
  return data.data; // { account_number, account_name, bank_id }
};

// ── 2. Create Transfer Recipient ──────────────────────────────────────────────
// Creates a reusable recipient record in Paystack. Returns recipient_code.
export const createTransferRecipient = async (name, accountNumber, bankCode) => {
  const { data } = await paystackAPI.post("/transferrecipient", {
    type: "nuban",
    name,
    account_number: accountNumber,
    bank_code: bankCode,
    currency: "NGN",
  });
  return data.data; // { recipient_code, id, ... }
};

// ── 3. Bulk Transfer ──────────────────────────────────────────────────────────
// Initiates multiple transfers in one API call.
// transfers: [{ amount, recipient, reference, reason }]
export const bulkTransfer = async (transfers) => {
  const { data } = await paystackAPI.post("/transfer/bulk", {
    currency: "NGN",
    source: "balance",
    transfers,
  });
  return data.data;
};

// ── 4. Webhook Signature Verification ────────────────────────────────────────
// Paystack signs the payload with HMAC-SHA512.
// We must validate before processing any webhook event.
export const verifyWebhookSignature = (rawBody, signature) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
};
