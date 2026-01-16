import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Capture the context Whop passed us (company_id, etc.)
  const returnParams = new URLSearchParams(searchParams as any).toString();

  // 2. Generate a secure random token for the "state"
  const csrfToken = crypto.randomUUID();

  // 3. Encode the state (token + original params)
  const state = {
    csrfToken,
    returnParams,
  };
  const encodedState = Buffer.from(JSON.stringify(state)).toString("base64");

  // 4. Build the Authorization URL using Environment Variables
  const oauthUrl = new URL("https://whop.com/oauth/authorize");
  oauthUrl.searchParams.set("client_id", process.env.WHOP_CLIENT_ID!);
  oauthUrl.searchParams.set("redirect_uri", process.env.WHOP_REDIRECT_URI!);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("state", encodedState);
  oauthUrl.searchParams.set("scope", "openid read_user"); // Essential scopes

  // 5. Create the redirect response
  const response = NextResponse.redirect(oauthUrl);

  // 6. Set the CSRF cookie so we can verify it on callback
  response.cookies.set("whop_csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}