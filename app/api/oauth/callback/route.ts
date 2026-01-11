// app/api/oauth/callback/route.ts
import { NextResponse } from "next/server";
import { WhopSDK } from "@whop/sdk";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) return NextResponse.json({ error: "No code" });

  try {
    // Exchange the code for a User Token
    const tokenResponse = await WhopSDK.oauth.token({
      code,
      clientId: process.env.WHOP_CLIENT_ID!,
      clientSecret: process.env.WHOP_CLIENT_SECRET!,
      redirectUri: process.env.WHOP_REDIRECT_URI!,
    });

    // Save the token in a Secure Cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("whop_access_token", tokenResponse.accessToken, {
      httpOnly: true, // JavaScript can't read this (Security +++)
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "OAuth Failed" });
  }
}