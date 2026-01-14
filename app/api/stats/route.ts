import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("whop_access_token");

    if (!token) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX 1: Use fetch instead of SDK for 'me' (bypass accessToken type error)
    const meRes = await fetch("https://api.whop.com/api/v2/me", {
        headers: { Authorization: `Bearer ${token.value}` }
    });
    
    if (!meRes.ok) throw new Error("Failed to fetch user");
    const me = await meRes.json();

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("business_id");

    if (!businessId)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    // FIX 2: Fetch companies using fetch as well or assume me has companies if using v2/me with expansions
    // Alternatively, just verify membership via API if needed. 
    // For now, let's fetch the companies list manually:
    const companiesRes = await fetch("https://api.whop.com/api/v2/me/companies", {
        headers: { Authorization: `Bearer ${token.value}` }
    });
    const companiesData = await companiesRes.json();
    const userCompanies = companiesData.data || [];

    // FIX 3: Add explicit type (any) to parameter
    const isMember = userCompanies.some(
      (company: any) => company.id === businessId
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Forbidden: You are not a member of this business" },
        { status: 403 }
      );
    }

    // 1. Get Credits
    const creditDoc = await db.collection("credits").doc(businessId).get();
    const credits = creditDoc.exists ? creditDoc.data()?.balance || 0 : 0;

    // 2. Get Recent Logs
    const logsSnapshot = await db
      .collection("businesses")
      .doc(businessId)
      .collection("attempts")
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    // FIX 4: Add explicit type (any) to doc parameter
    const logs = logsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      credits,
      logs,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}