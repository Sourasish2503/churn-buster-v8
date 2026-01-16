import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // --- CONFIGURATION ---
  // PASTE YOUR ID HERE DIRECTLY FOR THIS TEST:
  const HARDCODED_CLIENT_ID = "app_MS6Yv4SmtG0TNI"; 
  
  // PASTE YOUR VERCEL URL HERE DIRECTLY:
  const HARDCODED_REDIRECT_URI = "https://churn-buster-v8.vercel.app/api/oauth/callback";
  // ---------------------

  // 1. Capture context (params passed by Whop)
  const returnParams = new URLSearchParams(searchParams as any).toString();

  // 2. Generate security token
  const csrfToken = crypto.randomUUID();

  // 3. Build state (This is required by Whop)
  const state = {
    csrfToken,
    returnParams,
  };
  const encodedState = Buffer.from(JSON.stringify(state)).toString("base64");

  // 4. Build the URL
  const oauthUrl = new URL("https://whop.com/oauth/authorize");
  oauthUrl.searchParams.set("client_id", HARDCODED_CLIENT_ID);
  oauthUrl.searchParams.set("redirect_uri", HARDCODED_REDIRECT_URI);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", encodedState);
  oauthUrl.searchParams.set("scope", "openid read_user"); // Explicitly ask for access

  const response = NextResponse.redirect(oauthUrl);

  // 5. USE THE COOKIES IMPORT (Fixes your warning)
  // We save the token so we can verify it when the user comes back
  response.cookies.set("whop_csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}