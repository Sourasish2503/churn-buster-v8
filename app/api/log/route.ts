import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { businessId, collectionName, data } = await req.json();
    
    if (!businessId || !collectionName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Save to Firestore: businesses/{id}/{collectionName}/{auto_id}
    await db
      .collection("businesses")
      .doc(businessId)
      .collection(collectionName)
      .add({
        ...data,
        timestamp: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Log Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}