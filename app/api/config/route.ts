import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

// GET: Fetch config for the dashboard
export async function GET() {
  // In a real multi-tenant app, you'd check headers/session here.
  // For now, we return a default or the first document found.
  // Ideally, pass ?company_id=xyz in the URL.
  return NextResponse.json({ discountPercent: "30" }); 
}

// POST: Save config (Admin only)
export async function POST(req: Request) {
  try {
    const { discountPercent } = await req.json();
    // Hardcoded 'default' for now, but you should use the company_id from session
    await db.collection("configs").doc("default").set({ discountPercent }, { merge: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}