import  WhopSDK  from "@whop/sdk";

const apiKey = process.env.WHOP_API_KEY;

if (!apiKey) {
  throw new Error("❌ MISSING WHOP_API_KEY in .env file");
}

export const whop = new WhopSDK({ apiKey });