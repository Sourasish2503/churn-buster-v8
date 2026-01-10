import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code provided" }, { status: 400 });

  try {
    // 1. Exchange the temporary code for an Access Token
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_APP_URL}/api/oauth/callback`,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // 2. Get the User's Company ID using the token
    const meRes = await fetch("https://api.whop.com/api/v2/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const meData = await meRes.json();
    
    // Whop API structure for 'me' can vary, usually meData.companies[0].id 
    // or through the 'authorized_user' context.
    const businessId = meData.companies?.[0]?.id || meData.id; 

    // 3. Redirect to your Admin Dashboard with the ID
    return NextResponse.redirect(
      `${process.env.NEXT_APP_URL}/admin?business_id=${businessId}`
    );

  } catch (error) {
    console.error("OAuth Error", error);
    return NextResponse.json({ error: "Authentication Failed" }, { status: 500 });
  }
}