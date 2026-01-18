import { headers } from "next/headers";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { addPaidCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error("Missing WHOP_WEBHOOK_SECRET");
      return new Response("Server Misconfigured", { status: 500 });
    }

    // ✅ 1. READ RAW BODY
    const rawBody = await req.text();
    const signature = (await headers()).get("x-whop-signature");
    
    if (!signature) {
      return new Response("Missing Signature", { status: 400 });
    }

    // ✅ 2. VERIFY SIGNATURE
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return new Response("Invalid Signature", { status: 401 });
    }

    // ✅ 3. PARSE PAYLOAD
    const payload = JSON.parse(rawBody);

    // ✅ 4. HANDLE PAYMENT SUCCESS
    if (payload.action === "payment.succeeded") {
      const payment = payload.data;
      const companyId = payment.company_id; // Company receiving payment
      const amount = payment.final_amount; // Amount in cents

      console.log(`💰 Payment received for company ${companyId}: $${amount / 100}`);

      // Credit mapping ($50 = 10 credits, $200 = 50 credits, $700 = 200 credits)
      let creditsToAdd = 0;
      if (amount === 5000) creditsToAdd = 10;
      else if (amount === 20000) creditsToAdd = 50;
      else if (amount === 70000) creditsToAdd = 200;

      if (creditsToAdd > 0) {
        await addPaidCredits(companyId, creditsToAdd);
        console.log(`✅ Added ${creditsToAdd} credits to company ${companyId}`);
      }
    }

    return new Response("Webhook Processed", { status: 200 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Error", { status: 500 });
  }
}
