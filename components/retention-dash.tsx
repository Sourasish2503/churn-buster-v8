"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, DollarSign, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
  membershipId: string;
  companyId: string;
  experienceId: string; // ✅ Added
  discountPercent: string;
  customerName: string;
  isPreviewMode: boolean;
}

const cancellationReasons = [
  { id: 1, icon: DollarSign, label: "Too expensive", value: "price" },
  { id: 2, icon: Users, label: "Not using it enough", value: "usage" },
  { id: 3, icon: TrendingDown, label: "Missing features", value: "features" },
  { id: 4, icon: Clock, label: "Need a break", value: "break" },
];

export function RetentionDashboard({
  membershipId,
  companyId,
  experienceId, // ✅ Now receiving this
  discountPercent,
  customerName,
  isPreviewMode
}: DashboardProps) {
  const [step, setStep] = useState<"reasons" | "offer" | "success">("reasons");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReasonSelect = async (value: string) => {
    setSelectedReason(value);
    
    // ✅ Log to Firebase (no demo mode check)
    if (!isPreviewMode) {
      try {
        await fetch("/api/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: companyId,
            collectionName: "cancellation_reasons",
            data: {
              membershipId,
              experienceId, // ✅ Include experience ID
              reason: value,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to log reason:", err);
      }
    }
    
    setTimeout(() => setStep("offer"), 300);
  };

  const handleClaimOffer = async () => {
    setLoading(true);
    
    try {
      const response = await fetch("/api/claim-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membershipId,
          companyId,
          experienceId, // ✅ Include experience ID
          discountPercent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to apply offer");
      }

      setStep("success");
    } catch (e: any) {
      console.error("Error claiming offer:", e);
      alert(e.message || "System Error: Could not apply discount.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-black/60 border-purple-500/20 backdrop-blur-xl p-8">
        {/* Preview Mode Banner */}
        {isPreviewMode && (
          <div className="mb-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 text-center">
            <p className="text-yellow-500 font-semibold">Preview Mode</p>
          </div>
        )}

        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Wait {customerName}, before you go...
        </h1>

        {/* Step 1: Reasons */}
        {step === "reasons" && (
          <div className="space-y-4 mt-8">
            <p className="text-gray-400 text-center mb-6">
              Help us understand why you're leaving:
            </p>
            {cancellationReasons.map((reason) => {
              const Icon = reason.icon;
              return (
                <button
                  key={reason.id}
                  onClick={() => handleReasonSelect(reason.value)}
                  className={cn(
                    "group relative w-full rounded-lg border-2 p-5 transition-all duration-300 flex items-center gap-4",
                    selectedReason === reason.value
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-white/5 bg-black/20 hover:border-purple-500/50"
                  )}
                >
                  <Icon className="text-purple-400" size={24} />
                  <span className="text-white font-medium">{reason.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Offer */}
        {step === "offer" && (
          <div className="text-center mt-8 space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8">
              <p className="text-6xl font-bold text-white">{discountPercent}% OFF</p>
              <p className="text-white/80 mt-2">Next 3 Months</p>
            </div>
            
            <p className="text-gray-300">
              We'd hate to lose you, {customerName}.
            </p>

            <Button
              onClick={handleClaimOffer}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-6 text-lg"
            >
              {loading ? "Applying Discount..." : "Claim This Offer"}
            </Button>

            <button
              onClick={() => window.close()}
              className="text-gray-500 text-sm hover:text-gray-400"
            >
              No thanks, I still want to cancel
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center mt-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold text-white">Success!</h2>
            <p className="text-gray-300">
              Your {discountPercent}% discount has been applied!
            </p>
            <p className="text-sm text-gray-500">
              Membership ID: {membershipId.slice(0, 16)}...
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
