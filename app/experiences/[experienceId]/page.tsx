import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop";
import { RetentionDashboard } from "@/components/retention-dash";

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  
  try {
    // 1. Verify User
    const { userId } = await whopsdk.verifyUserToken(await headers());
    
    if (!userId) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-400">
              Unable to verify your Whop session.
            </p>
          </div>
        </div>
      );
    }

    // 2. Check Access
    const access = await whopsdk.users.checkAccess(experienceId, { id: userId });
    
    if (!access.has_access) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Access</h1>
            <p className="text-gray-400">
              You need an active membership to access this experience.
            </p>
          </div>
        </div>
      );
    }

    // ✅ 3. Get Membership (FIXED - use user_id singular)
    const memberships = await whopsdk.memberships.list({
      user_id: userId,  // ✅ Changed from whop_user_ids to user_id
      experience_id: experienceId,  // ✅ Singular, not array
      valid: true,
    });

    const membership = memberships.data?.[0];
    
    if (!membership) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No Active Membership</h1>
            <p className="text-gray-400">
              Could not find an active membership for this experience.
            </p>
          </div>
        </div>
      );
    }

    // ✅ 4. Get User Details (FIXED - handle missing email property)
    const user = await whopsdk.users.retrieve(userId);
    
    // Type assertion to access email safely
    const userWithEmail = user as { username?: string; email?: string; id: string };
    const customerName = userWithEmail.username || 
                        userWithEmail.email?.split('@')[0] || 
                        userId.slice(0, 8);

    // 5. Get Company ID
    const companyId = membership.company.id;
    const discountPercent = "30";

    // 6. Render Dashboard
    return (
      <RetentionDashboard
        membershipId={membership.id}
        companyId={companyId}
        experienceId={experienceId}
        discountPercent={discountPercent}
        customerName={customerName}
        isPreviewMode={false}
      />
    );

  } catch (error) {
    console.error("Experience Page Error:", error);
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Experience</h1>
          <p className="text-gray-400 text-sm mb-4">
            {error instanceof Error ? error.message : "Unknown error occurred"}
          </p>
          <p className="text-xs text-gray-500">Experience ID: {experienceId}</p>
        </div>
      </div>
    );
  }
}
