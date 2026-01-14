import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Capture the context Whop passed us (so we don't lose it)
  // Whop passes ?company_id=...&experience_id=... when opening the app
  const returnParams = new URLSearchParams(searchParams as any).toString();

  // 2. Generate a random value for CSRF protection
  const csrfToken = crypto.randomUUID();

  // 3. Build the state parameter
  const state = {
    csrfToken,
    returnParams,
  };
  const encodedState = Buffer.from(JSON.stringify(state)).toString("base64");

  // 4. Build the Whop OAuth URL (HARDCODED TEST)
  const oauthUrl = new URL("https://whop.com/oauth/authorize");
  
  // PASTE YOUR REAL ID HERE DIRECTLY:
  oauthUrl.searchParams.set("client_id", "app_Urg8gBmxqudKom"); 
  
  // PASTE YOUR REAL VERCEL DOMAIN HERE DIRECTLY:
  oauthUrl.searchParams.set("redirect_uri", "https://churn-buster-v8.vercel.app/api/oauth/callback");
  
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", encodedState);

  const response = NextResponse.redirect(oauthUrl);

  // 5. Set the CSRF token in a cookie
  response.cookies.set("whop_csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}