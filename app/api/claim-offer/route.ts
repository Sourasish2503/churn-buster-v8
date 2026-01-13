import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import WhopSDK from "@whop/sdk"; 
import { whop } from "@/lib/whop";      
import { useCredit } from "@/lib/credits";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const { membershipId, companyId, discountPercent } = await req.json();

    if (!membershipId || !companyId || !discountPercent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = cookies();
    const token = cookieStore.get('whop_access_token');

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    // FIX: Change 'accessToken' to 'apiKey'
    const userSdk = new WhopSDK({ apiKey: token.value });
    const me = await userSdk.me(); 

    if (!me.id) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // ... rest of your code ...