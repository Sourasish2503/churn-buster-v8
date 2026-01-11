"use client";
import { useEffect, useState } from "react";
import { createSdk, type WhopSdk } from "@whop/iframe";

export function useWhop() {
  const [sdk, setSdk] = useState<WhopSdk | null>(null);

  useEffect(() => {
    // This handshake works in React 18, 19, or vanilla JS
    const whop = createSdk({
      appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
    });
    setSdk(whop);
  }, []);

  return sdk;
}