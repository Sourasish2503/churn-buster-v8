import { verifyWhopUser } from "@/lib/whop";
import AdminDashboardClient from "./dashboard-client";

export default async function AdminPage() {
  // 1. SECURITY CHECK (Server-Side)
  const user = await verifyWhopUser();

  // 2. BLOCK UNAUTHORIZED
  if (!user || !user.userId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-400 mt-2">
          Could not verify Whop security token. <br/>
          Please open this app from the <strong>Whop Dashboard</strong>.
        </p>
      </div>
    );
  }

  // 3. ALLOW ACCESS
  return <AdminDashboardClient userId={user.userId} />;
}