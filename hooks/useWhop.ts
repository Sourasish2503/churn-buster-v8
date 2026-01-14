"use client";
import { useEffect, useState } from "react";
import { createSdk } from "@whop/iframe";

export function useWhop() {
  // FIX: Use <any> or let TS infer it to avoid 'no exported member' error
  const [sdk, setSdk] = useState<any | null>(null);

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