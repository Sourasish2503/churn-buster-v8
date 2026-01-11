import  WhopSDK  from "@whop/sdk";

// Initialize the SDK with your secure API key
// This runs on the server, so your key is safe.
export const whop = new WhopSDK({
  apiKey: process.env.WHOP_API_KEY as string,
});