"use client";

import { useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TreasureChestBonusProps {
  unitId: string;
  unitTitle: string;
  isUnlocked: boolean;
  bonusXP?: number;
  onClaim?: (unitId: string) => Promise<void>;
  className?: string;
}

/**
 * Interactive treasure chest bonus component (Duolingo-inspired)
 * Appears after completing a unit, rewards bonus XP when claimed
 */
export function TreasureChestBonus({
  unitId,
  unitTitle,
  isUnlocked,
  bonusXP = 50,
  onClaim,
  className,
}: TreasureChestBonusProps) {
  const [isClaimed, setIsClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleClaim = async () => {
    if (isClaimed || !isUnlocked || isClaiming) return;

    setIsClaiming(true);
    try {
      if (onClaim) {
        await onClaim(unitId);
      } else {
        // Default: Call API to claim bonus
        const response = await fetch(`/api/units/${unitId}/claim-bonus`, {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to claim bonus");
        }

        const data = await response.json();
        if (data.success) {
          toast.success(`🎉 Bonus claimed! +${bonusXP} XP earned!`);
        }
      }

      setIsClaimed(true);
      toast.success(`🎉 Bonus claimed! +${bonusXP} XP earned!`);
    } catch (error) {
      console.error("Error claiming bonus:", error);
      toast.error("Failed to claim bonus. Please try again.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center my-8 transition-all duration-300",
        !isUnlocked && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Treasure Chest */}
      <div
        className={cn(
          "relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all duration-300 cursor-pointer gpu-accelerated",
          isUnlocked && !isClaimed
            ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 hover:scale-110 active:scale-95 hover:shadow-2xl animate-pulse"
            : isClaimed
            ? "bg-gray-400 cursor-default"
            : "bg-gray-300 cursor-not-allowed",
          className
        )}
        onClick={isUnlocked && !isClaimed && !isClaiming ? handleClaim : undefined}
        onMouseEnter={() => isUnlocked && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        role="button"
        aria-label={
          isClaimed
            ? `Unit bonus for ${unitTitle} already claimed`
            : isUnlocked
            ? `Click to claim +${bonusXP} XP bonus for ${unitTitle}`
            : `Complete unit ${unitTitle} to unlock bonus`
        }
        aria-disabled={!isUnlocked || isClaimed || isClaiming}
        tabIndex={isUnlocked && !isClaimed ? 0 : -1}
      >
        {isClaimed ? (
          <Trophy className="h-10 w-10 text-yellow-800" />
        ) : (
          <>
            <Trophy className="h-10 w-10 text-yellow-900" />
            
            {/* Sparkles animation */}
            {isUnlocked && (
              <>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
                <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-yellow-400 animate-spin" style={{ animationDelay: "0.5s" }} />
              </>
            )}
          </>
        )}

        {/* Glow effect */}
        {isUnlocked && !isClaimed && (
          <div className="absolute inset-0 rounded-full bg-yellow-400/50 blur-xl animate-pulse" />
        )}
      </div>

      {/* Details Tooltip */}
      {showDetails && isUnlocked && !isClaimed && (
        <div className="absolute top-full mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-30 whitespace-nowrap">
          <div className="font-semibold mb-1">Unit Bonus! 🎁</div>
          <div className="text-xs text-gray-300">
            Click to claim +{bonusXP} XP
          </div>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
        </div>
      )}

      {/* Claiming state */}
      {isClaiming && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-400/20 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600" />
        </div>
      )}
    </div>
  );
}

