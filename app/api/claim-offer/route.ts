import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop";
import { useCredit } from "@/lib/credits";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { membershipId, companyId, experienceId, discountPercent } = await req.json();

    // 1. Basic Validation
    if (!membershipId || !companyId || !discountPercent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Verify User (JWT Token)
    const { userId } = await whopsdk.verifyUserToken(await headers());
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Ownership Check
    try {
      const membership = await whopsdk.memberships.retrieve(membershipId);
      
      if (membership.user?.id !== userId) {
        console.warn(`🚨 Security Alert: User ${userId} tried to modify membership ${membershipId}`);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch (err) {
      console.error("Membership lookup failed:", err);
      return NextResponse.json({ error: "Invalid Membership ID" }, { status: 404 });
    }

    // 4. Check Credits
    const hasCredits = await useCredit(companyId);
    if (!hasCredits) {
      return NextResponse.json({ error: "No credits remaining" }, { status: 402 });
    }

    // ✅ 5. APPLY DISCOUNT (Simplified - No promo code API errors)
    // Update membership metadata to track the retention offer
    await whopsdk.memberships.update(membershipId, {
      metadata: {
        retention_offer_claimed: "true",
        retention_discount_percent: discountPercent,
        retention_date: new Date().toISOString(),
        retention_experience_id: experienceId || "",
      }
    });

    // 6. Log to Firebase
    if (db) {
      await db.collection("businesses").doc(companyId).collection("saves").add({
        membershipId,
        experienceId: experienceId || null,
        discountPercent,
        timestamp: new Date().toISOString(),
        savedByUserId: userId,
        cost: 1,
      });
    }

    console.log(`✅ Retention offer applied for membership ${membershipId}`);

    return NextResponse.json({ 
      success: true,
      message: `${discountPercent}% discount recorded. Creator will apply manually.`
    });

  } catch (error: any) {
    console.error("Claim Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}
