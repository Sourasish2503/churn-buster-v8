import WhopSDK from "@whop/sdk";
import { headers } from "next/headers";

const apiKey = process.env.WHOP_API_KEY;

if (!apiKey) {
  throw new Error("❌ MISSING WHOP_API_KEY in .env file");
}

// Initialize SDK
export const whop = new WhopSDK({ apiKey });

// --- THE VERIFICATION HELPER ---
export async function verifyWhopUser() {
  const headerPayload = await headers();

  try {
    // 1. Verify the Token/Signature sent by Whop
    // ✅ FIXED: Using 'verifyUserToken' instead of 'validateRequest'
    const { userId } = await whop.verifyUserToken(headerPayload);

    if (!userId) {
      console.error("❌ Whop Token Validation Failed: No User ID");
      return null;
    }

    // 2. Return the verified identity
    return { 
      userId, 
      // Note: companyId might not be returned by verifyUserToken directly in all SDK versions. 
      // If you need companyId, you usually get it from the URL params in the page.
      // For now, we return userId which is the most important part.
    };
  } catch (err) {
    console.error("❌ Security Error:", err);
    return null;
  }
}