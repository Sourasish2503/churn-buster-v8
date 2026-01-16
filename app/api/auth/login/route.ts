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

  // 4. Build the Whop OAuth URL
  const oauthUrl = new URL("https://whop.com/oauth/authorize");
  
  // Use the environment variables we verified
  oauthUrl.searchParams.set("client_id", process.env.WHOP_CLIENT_ID!);
  oauthUrl.searchParams.set("redirect_uri", process.env.WHOP_REDIRECT_URI!);
  oauthUrl.searchParams.set("response_type", "code");
  // Pass the context as 'state' so we get it back after login
  oauthUrl.searchParams.set("state", encodedState);
  // Explicitly ask for user info scope
  oauthUrl.searchParams.set("scope", "openid read_user"); 

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