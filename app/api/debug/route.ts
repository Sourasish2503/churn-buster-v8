import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;
  
  return NextResponse.json({
    status: "Debug Info",
    hasClientId: !!clientId,
    clientIdPreview: clientId ? `${clientId.substring(0, 5)}...` : "MISSING",
    hasRedirectUri: !!redirectUri,
    redirectUriValue: redirectUri || "MISSING",
    // This will tell us if the OAuth URL is being built correctly
    testUrl: `https://whop.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`
  });
}