"use client"; // Still a client component for interactivity

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingDown, DollarSign, Clock, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the props we expect from the server
interface DashboardProps {
  membershipId: string;
  companyId: string;
  discountPercent: string;
  customerName?: string;
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
  discountPercent, 
  customerName,
  isPreviewMode 
}: DashboardProps) { // <--- Receive props here

  const [step, setStep] = useState<"reasons" | "offer" | "success">("reasons");
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReasonSelect = async (value: string) => {
    setSelectedReason(value);
    
    // Log the reason securely (Optional: api call)
    if (!isPreviewMode) {
      // Call your log API here
    }
    
    setTimeout(() => setStep("offer"), 300);
  };

  const handleClaimOffer = async () => {
    setLoading(true);

    if (isPreviewMode) {
      alert("PREVIEW MODE: In production, this would verify and apply the discount via SDK.");
      setLoading(false);
      setStep("success");
      return;
    }

    try {
      const response = await fetch("/api/claim-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We pass the IDs, but the API should verify them again if possible,
        // or rely on the fact that this page was rendered securely.
        body: JSON.stringify({
          membershipId,
          companyId,
          discountPercent,
        }),
      });

      if (!response.ok) throw new Error("Failed to apply offer");
      setStep("success");
    } catch (e) {
      console.error("Error claiming offer:", e);
      alert("System Error: Could not apply discount.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12">
      
      {/* Header with Personalized Name */}
      <div className="mb-8 text-center pt-8">
        {isPreviewMode && (
          <div className="mb-4 inline-block rounded-full border border-yellow-500/50 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-200">
             Preview Mode
          </div>
        )}
        
        <h1 className="text-4xl font-bold text-balance">
          <span className="text-neon-pink">Wait {customerName},</span> <span className="text-foreground">before you go...</span>
        </h1>
      </div>

      <div className="relative min-h-[400px]">
        {/* Step 1: Reasons */}
        {step === "reasons" && (
           /* ... (Keep your existing Reason UI code here, it's good) ... */
           <Card className="border-border/50 bg-card p-8 shadow-2xl backdrop-blur-xl">
             <div className="space-y-3">
               {cancellationReasons.map((reason) => {
                 const Icon = reason.icon;
                 return (
                   <button
                     key={reason.id}
                     onClick={() => handleReasonSelect(reason.value)}
                     className={cn(
                       "group relative w-full rounded-lg border-2 p-5 transition-all duration-300",
                       selectedReason === reason.value 
                         ? "border-neon-pink bg-neon-pink/10" 
                         : "border-white/5 bg-black/20 hover:border-neon-cyan/50",
                     )}
                   >
                     <div className="flex items-center gap-4">
                       <Icon className={cn("h-6 w-6", selectedReason === reason.value ? "text-neon-pink" : "text-gray-400")} />
                       <span className="text-lg font-medium text-white">{reason.label}</span>
                     </div>
                   </button>
                 )
               })}
             </div>
           </Card>
        )}

        {/* Step 2: Offer */}
        {step === "offer" && (
          <div className="relative overflow-hidden rounded-2xl border border-neon-cyan/30 bg-slate-900/80 p-8 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
            <h2 className="mb-3 text-3xl font-bold text-white">
              <span className="text-neon-cyan">{discountPercent}% OFF</span> <span>Next 3 Months</span>
            </h2>
            <p className="text-gray-400 mb-8">
              We&apos;d hate to lose you, {customerName}.
            </p>

            <Button onClick={handleClaimOffer} disabled={loading} className="w-full bg-neon-cyan text-black font-bold h-14 text-lg hover:bg-neon-cyan/90">
              {loading ? "Applying Discount..." : "Claim This Offer"}
            </Button>
            
            <button className="mt-4 w-full text-sm text-gray-500 hover:text-white">
              No thanks, I still want to cancel
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="text-center p-10 bg-slate-900/80 rounded-2xl border border-green-500/30">
             <Heart className="h-16 w-16 text-green-400 mx-auto mb-4" />
             <h2 className="text-3xl font-bold text-white mb-2">Success!</h2>
             <p className="text-gray-400">Discount applied to membership {membershipId.slice(0, 8)}...</p>
          </div>
        )}

      </div>
    </div>
  );
}