import { Suspense } from 'react';
import { cookies } from 'next/headers'; // Native Next.js cookies
import { redirect } from 'next/navigation';
import { RetentionDashboard } from "@/components/retention-dash";
import  WhopSDK  from "@whop/sdk";

// 1. Type Definitions
type VerifiedSession = {
  isValid: boolean;
  membershipId?: string;
  companyId?: string;
  customerName?: string;
  discountPercent: string;
  isPreviewMode: boolean;
  errorMessage?: string;
};

// 2. The Secure Session Logic
async function getWhopContext(searchParams: { [key: string]: string }): Promise<VerifiedSession> {
  const isDev = process.env.NODE_ENV === 'development';
  const cookieStore = cookies();
  const accessToken = cookieStore.get('whop_access_token'); // The key from your OAuth flow

  // --- SCENARIO A: PREVIEW MODE (Localhost) ---
  // If we are in Dev and have no real user token, show the preview automatically.
  if (isDev && !accessToken) {
    return {
      isValid: true,
      membershipId: "mem_dev_123",
      companyId: "biz_dev_test",
      customerName: "Developer (Local Preview)",
      discountPercent: "30",
      isPreviewMode: true // UI will show "Preview Mode" badge
    };
  }

  // --- SCENARIO B: PRODUCTION (Whop Native Security) ---
  // We MUST have an access token. If not, the user isn't logged in.
  if (!accessToken) {
    // In a real app, you might redirect to your OAuth login endpoint here
    // redirect('/api/auth/login'); 
    return {
      isValid: false,
      errorMessage: "Not Authenticated. Please open this app via Whop.",
      discountPercent: "0",
      isPreviewMode: false
    };
  }

  try {
    // 3. WHOP NATIVE VERIFICATION
    // Instead of using the Admin Key, we use the USER'S token.
    // This ensures we only see data this specific user is allowed to see.
    const userSdk = new WhopSDK({ accessToken: accessToken.value });
    
    // Fetch the user's true identity
    const me = await userSdk.me(); // Checks "Who am I?"
    
    if (!me.id) throw new Error("Invalid User Token");

    // NOW we can safely look up their membership using our Admin SDK (or the User SDK)
    // For this example, we assume we just need their User ID context.
    
    // Example: Validate they actually own the membership passed in URL (if any)
    // Or better: Fetch their active membership for this company automatically.
    
    return {
      isValid: true,
      membershipId: me.id, // Using their REAL ID, not the URL one
      companyId: searchParams.company_id || "default_company",
      customerName: me.username || "Valued Member",
      discountPercent: "30", // Fetch from DB based on me.id
      isPreviewMode: false
    };

  } catch (error) {
    console.error("Whop Native Verification Failed:", error);
    return { 
      isValid: false, 
      errorMessage: "Security Error: Unable to verify your Whop identity.",
      discountPercent: "0",
      isPreviewMode: false
    };
  }
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string } }) {
  const session = await getWhopContext(searchParams);

  if (!session.isValid) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="max-w-md text-center border border-red-900 bg-red-950/30 p-8 rounded-xl">
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">{session.errorMessage}</p>
          {/* Optional: Add a Login Button here */}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <Suspense fallback={<div className="text-white">Verifying Identity...</div>}>
        <RetentionDashboard 
          membershipId={session.membershipId!} 
          companyId={session.companyId!} 
          discountPercent={session.discountPercent}
          customerName={session.customerName}
          isPreviewMode={session.isPreviewMode}
        />
      </Suspense>
    </main>
  );
}