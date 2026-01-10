import { NextResponse } from "next/server";
import { whop } from "@/lib/whop";
import { useCredit } from "@/lib/credits";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { membershipId, companyId, discountPercent } = await req.json();

    if (!membershipId || !companyId || !discountPercent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. COMMERCE CHECK: Does the seller have credits?
    // We use the function we wrote in Phase 5
    const hasCredits = await useCredit(companyId);

    if (!hasCredits) {
      console.warn(`❌ Company ${companyId} has 0 credits. Offer blocked.`);
      return NextResponse.json({ 
        error: "Retention Unavailable", 
        details: "The creator has run out of retention credits." 
      }, { status: 402 }); // 402 Payment Required
    }

    // 2. WHOP ACTION: Apply the discount
    // We update the membership metadata or add a promo code. 
    // The cleanest way is often to add a 'credit' to the user's wallet 
    // or tag them so the next renewal is discounted.
    
    // Option A: Add a "perk" or metadata that your bot checks
    await whop.memberships.update({
      id: membershipId,
      metadata: {
        retention_offer_claimed: "true",
        retention_discount_percent: discountPercent,
        retention_date: new Date().toISOString()
      }
    });

    // Option B (Advanced): If Whop's API allows direct discount application
    // await whop.discounts.apply({ membershipId, percent: discountPercent });

    // 3. LOGGING: Save the success to Firebase for your Admin Panel stats
    await db.collection("businesses").doc(companyId).collection("saves").add({
      membershipId,
      discountPercent,
      timestamp: new Date().toISOString(),
      cost: 1 // 1 credit used
    });

    console.log(`✅ Offer applied for ${membershipId}. Credit deducted.`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Claim Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}