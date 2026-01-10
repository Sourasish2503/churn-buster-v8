import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("business_id");

  if (!businessId) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
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

    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      credits,
      logs
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}