"use client";
import { useEffect, useState } from "react";
import { createSdk, type WhopSdk } from "@whop/iframe";

export function useWhop() {
  const [sdk, setSdk] = useState<WhopSdk | null>(null);

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_WHOP_APP_ID;
    
    if (appId) {
      const whop = createSdk({ appId });
      setSdk(whop);
    } else {
      console.error("Missing NEXT_PUBLIC_WHOP_APP_ID");
    }
  }, []);

  return sdk;
}