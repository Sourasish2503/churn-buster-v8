import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;
  
  // 1. Build the URL manually to check for errors
  const params = new URLSearchParams({
    client_id: clientId || "MISSING_IN_VERCEL",  // If missing, it will print this text
    redirect_uri: redirectUri || "MISSING_IN_VERCEL",
    response_type: "code"
  });

  const fullUrl = `https://whop.com/oauth/authorize?${params.toString()}`;

  // 2. INSTEAD OF REDIRECTING, we return the data as text
  return NextResponse.json({
    status: "DEBUG_MODE",
    what_vercel_sees: {
      clientId: clientId ? `${clientId.substring(0, 5)}...` : "UNDEFINED",
      redirectUri: redirectUri || "UNDEFINED"
    },
    generated_url: fullUrl,
    instruction: "Copy the 'generated_url' below and paste it in your browser. If it works, your Env Vars are fine but your previous deploy was cached."
  });
}