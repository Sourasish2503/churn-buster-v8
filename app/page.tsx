import { Suspense } from 'react';
import { RetentionDashboard } from "@/components/retention-dash";
import { verifyWhopUser, whop } from "@/lib/whop";

// Helper to fetch membership details
async function getMembership(userId: string, companyId: string) {
  try {
    // FIX 1: Use 'first' instead of 'per_page' (Cursor Pagination)
    const response = await whop.memberships.list({
      user_ids: [userId],
      company_id: companyId,
      first: 5, // <--- CHANGED FROM per_page
    });

    // FIX 2: Check 'status' instead of 'valid'
    // We consider a user "Valid" if they are Active, Trialing, Past Due (grace period), or Completed (Lifetime)
    const validStatuses = ["active", "trialing", "past_due", "completed"];
    
    const activeMembership = response.data?.find((m) => 
      validStatuses.includes(m.status)
    );
    
    if (!activeMembership) return null;
    
    return {
      id: activeMembership.id,
      isValid: true
    };
  } catch (e) {
    console.error("Failed to fetch membership:", e);
    return null;
  }
}

export default async function Page({ searchParams }: { searchParams: { [key: string]: string } }) {
  const isDev = process.env.NODE_ENV === 'development';
  
  // --- SCENARIO A: PREVIEW MODE (Dev Environment) ---
  if (isDev) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
         <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/50">
           DEV MODE
         </div>
         <Suspense fallback={<div className="text-white">Loading...</div>}>
           <RetentionDashboard 
             membershipId="mem_dev_123" 
             companyId="biz_dev_test" 
             discountPercent="30"
             customerName="Dev User"
             isPreviewMode={true}
           />
         </Suspense>
      </main>
    );
  }

  // --- SCENARIO B: PRODUCTION (Signed Context) ---
  const user = await verifyWhopUser();

  if (!user || !user.userId) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="max-w-md text-center border border-red-900 bg-red-950/30 p-8 rounded-xl">
          <h1 className="text-xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-400">
            Unable to verify your session. <br/>
            Please open this app from the <strong>Whop Dashboard</strong>.
          </p>
        </div>
      </main>
    );
  }

  const companyId = searchParams.company_id;
  
  if (!companyId) {
     return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="text-center">
           <p className="text-red-400">Error: Missing Company Context</p>
        </div>
      </main>
    );
  }

  const membership = await getMembership(user.userId, companyId);

  if (!membership) {
     return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
        <div className="max-w-md text-center border border-yellow-900 bg-yellow-950/30 p-8 rounded-xl">
          <h1 className="text-xl font-bold text-yellow-500 mb-2">No Active Membership</h1>
          <p className="text-gray-400">
            You are verified, but we couldn't find an active membership for this company.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <RetentionDashboard 
          membershipId={membership.id} 
          companyId={companyId} 
          discountPercent="30"
          customerName="Valued Member"
          isPreviewMode={false}
        />
      </Suspense>
    </main>
  );
}