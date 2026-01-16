import { RetentionDashboard } from "@/components/retention-dash"; // Import your component
import { headers } from "next/headers";

export default function MemberPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // 1. Get query params from the URL (e.g. ?membership_id=123)
  // Whop sends these automatically when opening the app
  const membershipId = (searchParams.membership_id as string) || "demo_membership_123";
  const companyId = (searchParams.company_id as string) || "demo_company_456";
  
  // 2. Fetch real user name (Optional - simulating for now)
  // In a real app, you'd use the Whop API to get the name using the ID.
  const customerName = "Vector"; 

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* 3. We Render Your Component & Pass Data to it */}
      <RetentionDashboard 
        membershipId={membershipId}
        companyId={companyId}
        discountPercent="30" // You can make this dynamic later from your Admin DB
        customerName={customerName}
        isPreviewMode={false} // Set to true if you want to test the UI without API calls
      />
    </div>
  );
}