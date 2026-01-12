import { NextResponse } from "next/server";
import { cookies } from 'next/headers'; // <--- Moved to top
import  WhopSDK  from "@whop/sdk";    // <--- Moved to top
import { whop } from "@/lib/whop";      // Admin SDK
import { useCredit } from "@/lib/credits";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { membershipId, companyId, discountPercent } = await req.json();

    // 1. Basic Validation
    if (!membershipId || !companyId || !discountPercent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. SECURITY: Verify the User
    const cookieStore = cookies();
    const token = cookieStore.get('whop_access_token');

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    // Initialize User SDK to find out "Who is clicking this button?"
    const userSdk = new WhopSDK({ accessToken: token.value });
    const me = await userSdk.me(); // Get the logged-in user's ID

    if (!me.id) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // 3. OWNERSHIP CHECK (Critical Step)
    // We use our Admin SDK to look up the membership and check "Does this belong to the user?"
    try {
      const membership = await whop.memberships.get({ id: membershipId });
      
      // If the membership's owner ID doesn't match the logged-in user's ID... BLOCK IT.
      if (membership.user?.id !== me.id) {
        console.warn(`🚨 Security Alert: User ${me.id} tried to modify membership ${membershipId} belonging to ${membership.user?.id}`);
        return NextResponse.json({ error: "Forbidden: You do not own this membership" }, { status: 403 });
      }
    } catch (err) {
      console.error("Membership lookup failed:", err);
      return NextResponse.json({ error: "Invalid Membership ID" }, { status: 404 });
    }

    // 4. COMMERCE CHECK: Does the seller have credits?
    const hasCredits = await useCredit(companyId);

    if (!hasCredits) {
      console.warn(`❌ Company ${companyId} has 0 credits. Offer blocked.`);
      return NextResponse.json({ 
        error: "Retention Unavailable", 
        details: "The creator has run out of retention credits." 
      }, { status: 402 });
    }

    // 5. APPLY OFFER (Using Admin SDK)
    await whop.memberships.update({
      id: membershipId,
      metadata: {
        retention_offer_claimed: "true",
        retention_discount_percent: discountPercent,
        retention_date: new Date().toISOString()
      }
    });

    // 6. LOGGING
    await db.collection("businesses").doc(companyId).collection("saves").add({
      membershipId,
      discountPercent,
      timestamp: new Date().toISOString(),
      cost: 1,
      savedByUserId: me.id // Good to track who saved it
    });

    console.log(`✅ Offer applied for ${membershipId}. Credit deducted.`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Claim Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}