import { headers } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";

// --- HELPER TO SIMULATE DB UPDATE ---
// In a real app, this would be a Supabase/Postgres call.
async function addPaidCredits(userId: string, amountPaid: number) {
  // Logic: $50 = 10 credits, $200 = 50 credits, $700 = 200 credits
  let creditsToAdd = 0;
  
  if (amountPaid === 5000) creditsToAdd = 10;      // Whop sends amounts in CENTS ($50.00 -> 5000)
  else if (amountPaid === 20000) creditsToAdd = 50; // $200.00
  else if (amountPaid === 70000) creditsToAdd = 200; // $700.00
  
  console.log(`[DB SUCCESS] Added ${creditsToAdd} credits to user ${userId}`);
  return true;
}

export async function POST(req: Request) {
  try {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) {
      console.error("Missing WHOP_WEBHOOK_SECRET");
      return new Response("Server Misconfigured", { status: 500 });
    }

    // 1. READ THE RAW BODY (Required for verification)
    const rawBody = await req.text();
    const signature = (await headers()).get("x-whop-signature");

    if (!signature) return new Response("Missing Signature", { status: 400 });

    // 2. SECURITY CHECK (Verify it came from Whop)
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return new Response("Invalid Signature", { status: 401 });
    }

    // 3. PARSE DATA
    const payload = JSON.parse(rawBody);
    
    // 4. HANDLE THE PAYMENT
    if (payload.action === "payment.succeeded") {
      const payment = payload.data;
      const userId = payment.user_id; // The user who paid
      const amount = payment.final_amount; // Amount in cents
      
      console.log(`💰 Payment received from ${userId} for $${amount/100}`);

      // Give them the credits
      await addPaidCredits(userId, amount);
    }

    return new Response("Webhook Processed", { status: 200 });

  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Error", { status: 500 });
  }
}