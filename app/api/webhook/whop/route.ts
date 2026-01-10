import { headers } from "next/headers";
import crypto from "crypto";
import { addPaidCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) return new Response("Server Misconfigured", { status: 500 });

    // 1. Read the raw body (Required for verification)
    const rawBody = await req.text();
    
    // 2. Verify Signature
    const signature = (await headers()).get("x-whop-signature");
    if (!signature) return new Response("Missing Signature", { status: 400 });

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return new Response("Invalid Signature", { status: 401 });
    }

    // 3. Process the Event
    const payload = JSON.parse(rawBody);

    if (payload.action === "payment.succeeded") {
      const companyId = payload.company_id;
      const amountPaid = payload.payment?.amount; // In cents usually, depends on your pricing

      // Example Logic: $50 = 10 credits
      let credits = 0;
      if (amountPaid >= 5000) credits = 10;
      if (amountPaid >= 20000) credits = 50;

      if (companyId && credits > 0) {
        await addPaidCredits(companyId, credits);
      }
    }

    return new Response("Webhook Received", { status: 200 });

  } catch (err) {
    console.error("Webhook Error:", err);
    return new Response("Internal Error", { status: 500 });
  }
}