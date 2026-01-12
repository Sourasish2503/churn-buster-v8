import { headers } from "next/headers";
import crypto from "crypto";
import { addPaidCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const secret = process.env.WHOP_WEBHOOK_SECRET;
    if (!secret) return new Response("Server Misconfigured", { status: 500 });

    const rawBody = await req.text();
    const signature = (await headers()).get("x-whop-signature");
    
    if (!signature) return new Response("Missing Signature", { status: 400 });

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    // Fix: Prevent length mismatch error
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return new Response("Invalid Signature", { status: 401 });
    }

    // ... (rest of your logic remains the same)

    return new Response("Webhook Received", { status: 200 });
  } catch (err) {
    // ... error handling
    return new Response("Error", { status: 500 });
  }
}