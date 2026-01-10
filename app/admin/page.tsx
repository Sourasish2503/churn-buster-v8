"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Sparkles, Zap } from "lucide-react"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)
  const [discountPercent, setDiscountPercent] = useState("30")
  
  const searchParams = useSearchParams()
  // Resolve ID from Whop parameters
  const businessId = searchParams.get("business_id") || 
                     searchParams.get("company_id") || 
                     searchParams.get("companyId");

  // Load initial config
  useEffect(() => {
    // In production, fetch specific company config here
  }, []);

  const handleSaveConfig = async () => {
    setLoading(true)
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountPercent })
      });
      alert("Offer updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save config");
    } finally {
      setLoading(false);
    }
  }

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
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center gap-3 border-b border-white/10 pb-6">
          <Sparkles className="text-neon-cyan h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Retention Command Center</h1>
            <p className="text-gray-400">Manage your churn reduction strategy</p>
          </div>
        </header>

        <Card className="p-8 border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-neon-pink" />
            <h2 className="text-xl font-semibold">Discount Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Discount Percentage</label>
              <div className="relative">
                <input
                  type="number"
                  value={discountPercent}
                  onChange={e => setDiscountPercent(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-lg text-white focus:border-neon-pink/50 focus:outline-none text-lg"
                />
                <span className="absolute right-4 top-4 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This discount will be offered to users attempting to cancel.
              </p>
            </div>
            <Button onClick={handleSaveConfig} disabled={loading} className="w-full h-12 bg-white text-black font-bold hover:bg-gray-200">
              {loading ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </Card>

      </div>
    </div>
  )
}