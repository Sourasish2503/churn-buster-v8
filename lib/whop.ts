import { Whop } from "@whop/sdk";
import { headers } from "next/headers";

// ✅ CRITICAL: Ensure these env vars are set
const apiKey = process.env.WHOP_API_KEY;
const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID;

if (!apiKey) {
  throw new Error("❌ MISSING WHOP_API_KEY in environment variables");
}

if (!appId) {
  throw new Error("❌ MISSING NEXT_PUBLIC_WHOP_APP_ID in environment variables");
}

// Initialize Whop SDK
export const whopsdk = new Whop({
  apiKey,
  appID: appId,
});

// For backwards compatibility
export const whop = whopsdk;

// ✅ JWT Token Verification (Required for App Store apps)
export async function verifyWhopUser() {
  try {
    const headerPayload = await headers();
    const { userId } = await whopsdk.verifyUserToken(headerPayload);
    
    if (!userId) {
      console.error("❌ Whop Token Validation Failed: No User ID");
      return null;
    }

    return { userId };
  } catch (err) {
    console.error("❌ Whop Security Error:", err);
    return null;
  }
}
