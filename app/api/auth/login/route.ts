import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // 1. Capture the context Whop passed us (so we don't lose it)
  // Whop passes ?company_id=...&experience_id=... when opening the app
  const returnParams = new URLSearchParams(searchParams as any).toString();
  
  // 2. Build the Whop OAuth URL
  const oauthUrl = new URL("https://whop.com/oauth/authorize");
  oauthUrl.searchParams.set("client_id", process.env.WHOP_CLIENT_ID!);
  oauthUrl.searchParams.set("redirect_uri", process.env.WHOP_REDIRECT_URI!);
  oauthUrl.searchParams.set("response_type", "code");
  // Pass the context as 'state' so we get it back after login
  oauthUrl.searchParams.set("state", returnParams); 
  
  return NextResponse.redirect(oauthUrl);
}