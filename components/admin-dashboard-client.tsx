"use client";

import { useState, useEffect } from "react";
import { Zap, Shield, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AdminDashboardClientProps {
  userId: string;
  companyId: string;
  companyName: string;
}

export default function AdminDashboardClient({ 
  userId, 
  companyId,
  companyName 
}: AdminDashboardClientProps) {
  const [loading, setLoading] = useState(false);
  const [discountPercent, setDiscountPercent] = useState("30");
  const [stats, setStats] = useState({ credits: 0, saves: 0 });

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [companyId]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/stats?company_id=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setStats({ credits: data.credits || 0, saves: data.saves || 0 });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, discountPercent }),
      });
      
      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Churn Buster Dashboard
          </h1>
          <p className="text-gray-400">{companyName}</p>
          <p className="text-sm text-gray-500">Admin: {userId}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/40 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Credits Remaining</p>
                <p className="text-3xl font-bold text-white">{stats.credits}</p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Members Saved</p>
                <p className="text-3xl font-bold text-white">{stats.saves}</p>
              </div>
              <Shield className="text-green-500" size={32} />
            </div>
          </Card>

          <Card className="bg-black/40 border-purple-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-3xl font-bold text-green-500">●</p>
              </div>
              <Activity className="text-blue-500" size={32} />
            </div>
          </Card>
        </div>

        {/* Settings */}
        <Card className="bg-black/40 border-purple-500/20 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Retention Offer Settings</h2>
          
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">
              Discount Percentage
            </label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="w-full bg-black/60 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
              min="1"
              max="100"
            />
          </div>

          <Button
            onClick={handleSaveConfig}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
