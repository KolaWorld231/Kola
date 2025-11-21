"use client";

import { useEffect, useState } from "react";
import { HeartRecovery } from "@/components/hearts/heart-recovery";

interface HeartsWidgetProps {
  initialHearts: number;
  maxHearts?: number;
  nextHeartRegeneration?: Date | string | null;
}

export function HeartsWidget({
  initialHearts,
  maxHearts = 5,
  nextHeartRegeneration,
}: HeartsWidgetProps) {
  const [hearts, setHearts] = useState(initialHearts);
  const [timeUntilNext, setTimeUntilNext] = useState<number | null>(null);

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

  // Only show recovery widget if hearts are low
  if (hearts >= maxHearts) {
    return null;
  }

  return (
    <HeartRecovery
      currentHearts={hearts}
      maxHearts={maxHearts}
      nextRecoveryTime={nextHeartRegeneration}
      timeUntilNextHeart={timeUntilNext}
      onRecover={fetchHearts}
      onWatchAd={fetchHearts}
    />
  );
}






