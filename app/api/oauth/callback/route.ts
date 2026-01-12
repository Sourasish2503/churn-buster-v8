// app/api/oauth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Contains company_id context

  if (!code) return NextResponse.json({ error: "No code provided" });

  try {
    // 1. Manually exchange code for token (More reliable than SDK static methods)
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("OAuth Error:", errorText);
      throw new Error("Failed to exchange token");
    }

    const tokenData = await tokenRes.json();

    // 2. Reconstruct the return URL with context
    const returnUrl = new URL("/", request.url);
    if (state) {
      const stateParams = new URLSearchParams(state);
      stateParams.forEach((v, k) => returnUrl.searchParams.set(k, v));
    }

    const response = NextResponse.redirect(returnUrl);

    // 3. Set Secure Cookie
    response.cookies.set("whop_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: tokenData.expires_in || 3600,
    });

    return response;

  } catch (error) {
    console.error("OAuth Handler Failed:", error);
    return NextResponse.json({ error: "Authentication Failed" }, { status: 500 });
  }
}