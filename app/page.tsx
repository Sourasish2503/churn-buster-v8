import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { RetentionDashboard } from "@/components/retention-dash";
import WhopSDK from "@whop/sdk";

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
  const isDev = process.env.NODE_ENV === 'development';
  const cookieStore = cookies();
  const accessToken = cookieStore.get('whop_access_token');
  
  // Get Company ID from URL (Whop passes this when loading the app)
  const companyId = searchParams.company_id;

  // --- SCENARIO A: PREVIEW MODE ---
  if (isDev && !accessToken) {
    return {
      isValid: true,
      membershipId: "mem_dev_123",
      companyId: "biz_dev_test",
      customerName: "Dev User",
      discountPercent: "30",
      isPreviewMode: true 
    };
  }

  // --- SCENARIO B: PRODUCTION (Auto-Redirect) ---
  if (!accessToken) {
    // PASS THE PARAMS to the login route so they are preserved
    const params = new URLSearchParams(searchParams).toString();
    redirect(`/api/auth/login?${params}`); 
  }

  try {
    const userSdk = new WhopSDK({ accessToken: accessToken.value });
    const me = await userSdk.me(); 

    if (!companyId) {
      // If we are logged in but lost the company_id, we can't find the membership.
      // Fallback: try to guess or show error.
      throw new Error("Missing Company Context");
    }

    // 4. FETCH REAL MEMBERSHIP (The Fix for "Demo Data" Rejection)
    // We need to find which membership the user has for THIS company.
    const memberships = await userSdk.listMyMemberships({
        valid: true,
        company_id: companyId
    });

    const activeMembership = memberships.data?.[0];

    if (!activeMembership) {
        return {
            isValid: false,
            errorMessage: "You do not have an active membership with this company.",
            discountPercent: "0",
            isPreviewMode: false
        }
    }

    return {
      isValid: true,
      membershipId: activeMembership.id, // REAL Membership ID (mem_xxx)
      companyId: companyId,
      customerName: me.username || "Valued Member",
      discountPercent: "30", // TODO: Fetch from your DB based on companyId
      isPreviewMode: false
    };

  } catch (error) {
    console.error("Whop Native Verification Failed:", error);
    // If token is invalid, clear it and retry login
    if (String(error).includes("401")) {
        redirect('/api/auth/login');
    }
    
    return { 
      isValid: false, 
      errorMessage: "Unable to verify your membership.",
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
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Issue</h1>
          <p className="text-gray-400">{session.errorMessage}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
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