"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, Shield, CreditCard, Activity, Save, ShieldAlert, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("30");
  const searchParams = useSearchParams();
  
  const businessId = searchParams.get("business_id") || 
                     searchParams.get("company_id") || 
                     searchParams.get("companyId");

  // --- 🔴 PASTE YOUR COPIED LINKS HERE ---
  const PRICING_LINKS = {
    starter: "https://whop.com/vector-4191/10-save-credits/", 
    growth:  "https://whop.com/vector-4191/50-save-credits/",
    scale:   "https://whop.com/vector-4191/200-save-credits/"
  };
  // ---------------------------------------

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercent })
      });
      alert("Offer updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save config");
    } finally {
      setLoading(false);
    }
  };

  if (!businessId) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold">Access Restricted</h1>
          <p className="text-gray-400 mt-2">Please open this via the Whop Dashboard.</p>
        </div>
      </div>
    );
  }

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
          <div className="text-right space-y-1">
            <div className="text-xs text-gray-500">System Status</div>
            <div className="flex items-center justify-end gap-2 text-sm text-red-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Paused (No Credits)
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3 flex items-center gap-3 text-yellow-500 text-sm">
          <div className="p-1 bg-yellow-900/50 rounded-full"><Zap size={14} /></div>
          <span><strong>Low credit balance (0)</strong> — Top up to keep retention active</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard title="Revenue Protected" value="$0" />
          <StatsCard title="Churn Attempts Stopped" value="0" />
          <StatsCard title="Credits Available" value="0" active />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30 group-hover:opacity-60 transition" />
            <div className="flex items-center gap-2 mb-6 text-purple-400">
              <Zap size={18} />
              <h2 className="font-semibold text-white">Offer Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Discount Percentage</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 transition font-mono text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Users will be offered this discount for 3 months to prevent cancellation.</p>
              </div>
              <button onClick={handleSaveConfig} disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={18} /> {loading ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 min-h-[250px] flex flex-col">
             <div className="flex items-center gap-2 mb-6 text-cyan-400">
              <Shield size={18} />
              <h2 className="font-semibold text-white">Live Activity Feed</h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 space-y-2">
              <Activity size={32} className="opacity-20" />
              <p className="text-sm">No activity recorded yet.</p>
            </div>
          </div>
        </div>

        {/* Top Up Section (Now Functional!) */}
        <div>
          <h3 className="text-xl font-bold mb-6 text-center">Top Up Credits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CreditCardBox 
              title="10 Save Credits" 
              desc="Good for testing things out." 
              price="$50" 
              credits="10" 
              href={PRICING_LINKS.starter} // Link Connected
            />
            <CreditCardBox 
              title="50 Save Credits" 
              desc="Best for growing communities." 
              price="$200" 
              credits="50" 
              popular 
              href={PRICING_LINKS.growth} // Link Connected
            />
            <CreditCardBox 
              title="200 Save Credits" 
              desc="Maximum retention power." 
              price="$700" 
              credits="200" 
              href={PRICING_LINKS.scale} // Link Connected
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Updated Sub Components ---

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

// Now this is a Link <a> instead of just a div
function CreditCardBox({ title, desc, price, credits, popular, href }: { title: string, desc: string, price: string, credits: string, popular?: boolean, href: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`block bg-[#0A0A0A] border ${popular ? "border-cyan-500/50" : "border-gray-800"} rounded-xl p-6 relative group hover:bg-[#111] transition cursor-pointer hover:-translate-y-1 duration-300`}
    >
      {popular && (
        <div className="absolute -top-3 right-4 bg-cyan-400 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          Most Popular
        </div>
      )}
      <div className={`w-10 h-10 rounded-lg ${popular ? "bg-cyan-900/30 text-cyan-400" : "bg-gray-900 text-gray-400"} flex items-center justify-center mb-4`}>
        {popular ? <Zap size={20} /> : <CreditCard size={20} />}
      </div>
      <h4 className="font-bold text-lg mb-1">{title}</h4>
      <p className="text-xs text-gray-500 mb-6 h-8">{desc}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{price}</span>
        <span className="text-gray-500 text-sm">/ {credits} credits</span>
      </div>
      
      {/* Visual Indicator that it's clickable */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition text-cyan-500">
        <ExternalLink size={16} />
      </div>
    </a>
  );
}