"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { HeartRecovery } from "./heart-recovery";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface HeartsDisplayProps {
  initialHearts: number;
  maxHearts?: number;
  nextHeartRegeneration?: Date | string | null;
  className?: string;
  showRecovery?: boolean;
  compact?: boolean;
}

export function HeartsDisplay({
  initialHearts,
  maxHearts = 5,
  nextHeartRegeneration,
  className,
  showRecovery = false,
  compact = false,
}: HeartsDisplayProps) {
  const [hearts, setHearts] = useState(initialHearts);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  useEffect(() => {
    if (nextHeartRegeneration) {
      const nextTime = new Date(nextHeartRegeneration).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const remaining = Math.max(0, nextTime - now);
        setTimeUntilNext(remaining > 0 ? remaining : null);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [nextHeartRegeneration]);

  const fetchHearts = async () => {
    try {
      const response = await fetch("/api/user/me");
      if (response.ok) {
        const data = await response.json();
        setHearts(data.hearts || initialHearts);
        if (data.nextHeartRegeneration) {
          const nextTime = new Date(data.nextHeartRegeneration).getTime();
          const now = new Date().getTime();
          setTimeUntilNext(Math.max(0, nextTime - now));
        }
      }
    } catch (error) {
      console.error("Error fetching hearts:", error);
    }
  };

  useEffect(() => {
    // Refresh hearts periodically
    const interval = setInterval(fetchHearts, 60000); // Every minute
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (compact) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Heart
            key={i}
            className={`h-5 w-5 ${
              i < hearts
                ? "text-destructive fill-destructive"
                : "text-foreground-light fill-none"
            }`}
          />
        ))}
        {hearts < maxHearts && showRecovery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecoveryModal(true)}
            className="ml-2 text-xs"
          >
            Recover
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <Heart
            key={i}
            className={`h-6 w-6 ${
              i < hearts
                ? "text-destructive fill-destructive"
                : "text-foreground-light fill-none"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-foreground-light">
          {hearts} / {maxHearts}
        </span>
        {hearts === 0 && (
          <span className="text-sm text-destructive font-medium ml-2">
            No hearts left!
          </span>
        )}
        {hearts < maxHearts && showRecovery && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRecoveryModal(true)}
            className="ml-2"
          >
            Recover Hearts
          </Button>
        )}
      </div>

      {showRecoveryModal && (
        <Modal
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          title="Heart Recovery"
          size="md"
        >
          <HeartRecovery
            currentHearts={hearts}
            maxHearts={maxHearts}
            nextRecoveryTime={nextHeartRegeneration}
            timeUntilNextHeart={timeUntilNext}
            onRecover={fetchHearts}
            onWatchAd={fetchHearts}
          />
        </Modal>
      )}
    </>
  );
}

