import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import WhopSDK from "@whop/sdk";

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("whop_access_token")!;

    const userSdk = new WhopSDK({ accessToken: token.value });
    const me = await userSdk.me();

    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get("business_id");

    if (!businessId)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    const userCompanies = await me.getCompanies();

    const isMember = userCompanies.some(
      (company) => company.id === businessId
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

    // 2. Get Recent Logs (Last 5 attempts)
    const logsSnapshot = await db
      .collection("businesses")
      .doc(businessId)
      .collection("attempts")
      .orderBy("timestamp", "desc")
      .limit(5)
      .get();

    const logs = logsSnapshot.docs.map((doc) => ({
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