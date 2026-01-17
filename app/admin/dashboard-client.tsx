"use client";

import { useState } from "react";
import { Zap, Shield, CreditCard, Activity, Save, ShieldAlert, ExternalLink } from "lucide-react";

// This component receives the verified User ID from the server
export default function AdminDashboardClient({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("30");
  
  // LINKS (Update these with your real Whop Checkout Links)
  const PRICING_LINKS = {
    starter: "https://whop.com/checkout/YOUR_LINK_1", 
    growth:  "https://whop.com/checkout/YOUR_LINK_2",
    scale:   "https://whop.com/checkout/YOUR_LINK_3"
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
      alert("Offer updated successfully!");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs text-cyan-400 font-medium mb-4">
              <Zap size={12} fill="currentColor" /> Admin Control
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Retention <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200" style={{ textShadow: "0 0 20px rgba(34,211,238,0.3)" }}>Command</span>
            </h1>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-500">Logged in as:</p>
             <p className="font-mono text-cyan-500 text-sm">{userId}</p>
          </div>
        </div>

        {/* ... (Paste the rest of your Stats Cards, Grid, and Top Up sections here) ... */}
        {/* If you need the full UI code block again, let me know, but it is the same as before! */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard title="Revenue Protected" value="$0" />
            <StatsCard title="Churn Attempts Stopped" value="0" />
            <StatsCard title="Credits Available" value="0" active />
         </div>
         {/* ... (Continue with the rest of the UI) ... */}
         
      </div>
    </div>
  );
}

// Sub-components used above
function StatsCard({ title, value, active = false }: { title: string, value: string, active?: boolean }) {
  return (
    <div className="bg-[#0A0A0A] border border-gray-800 rounded-xl p-6 flex flex-col justify-between h-32 relative overflow-hidden">
      {active && <div className="absolute inset-0 bg-cyan-500/5 blur-xl" />}
      <span className="text-gray-500 text-sm font-medium">{title}</span>
      <span className={`text-4xl font-bold ${active ? "text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}