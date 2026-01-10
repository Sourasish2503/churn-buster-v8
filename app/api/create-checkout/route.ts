import { NextResponse } from "next/server";
// whop SDK not required here yet

export async function POST(req: Request) {
  try {
    const { packSize } = await req.json(); // "10", "50", "200"
    
    // In a real app, these are your Product Page links from Whop
    const pricingLinks: Record<string, string> = {
      "10": "https://whop.com/checkout/YOUR_PRODUCT_LINK_FOR_10",
      "50": "https://whop.com/checkout/YOUR_PRODUCT_LINK_FOR_50",
      "200": "https://whop.com/checkout/YOUR_PRODUCT_LINK_FOR_200",
    };

    const url = pricingLinks[packSize];

    if (!url) return NextResponse.json({ error: "Invalid Pack" }, { status: 400 });

    return NextResponse.json({ url });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}