import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { whop } from "@/lib/whop";      
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

    // FIX 1: Fetch "Me" directly from API
    const meResponse = await fetch("https://api.whop.com/api/v2/me", {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json"
      }
    });

    if (!meResponse.ok) {
      console.error("Failed to fetch user:", await meResponse.text());
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const me = await meResponse.json();

    if (!me.id) {
      return NextResponse.json({ error: "Unauthorized: User ID not found" }, { status: 401 });
    }

    // 3. OWNERSHIP CHECK
    try {
      // FIX 2: Use .retrieve(string_id)
      const membership = await whop.memberships.retrieve(membershipId);
      
      if (membership.user?.id !== me.id) {
        console.warn(`🚨 Security Alert: User ${me.id} tried to modify membership ${membershipId}`);
        return NextResponse.json({ error: "Forbidden: You do not own this membership" }, { status: 403 });
      }
    } catch (err) {
      console.error("Membership lookup failed:", err);
      return NextResponse.json({ error: "Invalid Membership ID" }, { status: 404 });
    }

    // 4. COMMERCE CHECK
    const hasCredits = await useCredit(companyId);

    if (!hasCredits) {
      return NextResponse.json({ 
        error: "Retention Unavailable", 
        details: "The creator has run out of retention credits." 
      }, { status: 402 });
    }

    // 5. APPLY OFFER (Using Admin SDK)
    // FIX 3: update(id, params) - ID must be the first argument
    await whop.memberships.update(membershipId, {
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
      savedByUserId: me.id 
    });

    console.log(`✅ Offer applied for ${membershipId}. Credit deducted.`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Claim Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}