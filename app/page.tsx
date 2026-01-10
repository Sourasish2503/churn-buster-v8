import { Suspense } from 'react';
import { RetentionDashboard } from "@/components/retention-dash";
import { whop } from "@/lib/whop";

// 1. Define what data the Client needs (Type Safety)
type VerifiedSession = {
  isValid: boolean;
  membershipId?: string;
  companyId?: string;
  customerName?: string;
  discountPercent: string;
  isPreviewMode: boolean;
  errorMessage?: string;
};

async function getWhopContext(searchParams: { [key: string]: string }): Promise<VerifiedSession> {
  const membershipId = searchParams.membership_id || searchParams.membershipId;
  const companyId = searchParams.company_id || searchParams.business_id;
  
  // PREVIEW MODE: If we have a company ID but no membership, it's the Creator looking at their own dashboard.
  if (!membershipId && companyId) {
    return {
      isValid: true,
      companyId,
      discountPercent: "30", // Default or fetch from DB
      isPreviewMode: true,
      customerName: "Creator (Preview)"
    };
  }

  // REAL USER MODE: We have a membership ID. Let's verify it with the SDK.
  if (membershipId) {
    try {
      // THIS IS THE KEY: We fetch the membership using the SDK.
      // If this fails, the ID is fake or invalid.
      const membership = await whop.memberships.get({ id: membershipId });
      
      // Optional: Fetch company config from your own DB or metadata
      // const config = await db.getConfig(membership.companyId);

      return {
        isValid: true,
        membershipId: membership.id,
        companyId: membership.companyId,
        customerName: membership.user?.username || "Valued Member",
        discountPercent: "30", // Dynamic value from config
        isPreviewMode: false
      };
    } catch (error) {
      console.error("SDK Verification Failed:", error);
      return { 
        isValid: false, 
        errorMessage: "Security Alert: Unable to verify membership ownership.",
        discountPercent: "0",
        isPreviewMode: false
      };
    }
  }

  return { 
    isValid: false, 
    errorMessage: "No context provided. Please open via Whop.", 
    discountPercent: "0",
    isPreviewMode: false
  };
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string } }) {
  // 1. Run Server-Side Validation
  const session = await getWhopContext(searchParams);

  // 2. Handle Unauthorized/Invalid Access
  if (!session.isValid) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="max-w-md text-center border border-red-900 bg-red-950/30 p-8 rounded-xl">
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">{session.errorMessage}</p>
        </div>
      </main>
    );
  }

  // 3. Render the Dashboard with VERIFIED props
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black">
      <Suspense fallback={<div className="text-white">Loading secure session...</div>}>
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