import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}` });

export const {
  PORT = 5000,
  DB_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  PAYSTACK_SECRET_KEY,
  CLAUDE_API_KEY,
  GROQ_API_KEY,
  NODE_ENV,
} = process.env;