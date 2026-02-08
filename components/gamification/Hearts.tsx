"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import type { HeartsState } from "@/types/gamification";

interface HeartsProps {
  current: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
  onHeartLost?: () => void;
}

const sizeClasses = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Hearts({
  current,
  max = 5,
  size = "md",
  showCount = false,
  className = "",
  onHeartLost,
}: HeartsProps) {
  const [prevCurrent, setPrevCurrent] = useState(current);
  const [lostHeartIndex, setLostHeartIndex] = useState<number | null>(null);
  const iconSize = sizeClasses[size];

  useEffect(() => {
    if (current < prevCurrent) {
      // Heart was lost
      setLostHeartIndex(current);
      onHeartLost?.();
      
      setTimeout(() => {
        setLostHeartIndex(null);
      }, 600);
    }
    setPrevCurrent(current);
  }, [current, prevCurrent, onHeartLost]);

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < current;
        const isLosing = index === lostHeartIndex;

        return (
          <motion.div
            key={index}
            initial={false}
            animate={
              isLosing
                ? {
                    scale: [1, 1.3, 0],
                    rotate: [0, -15, 15, 0],
                    opacity: [1, 1, 0],
                  }
                : isFilled
                ? { scale: 1, opacity: 1 }
                : { scale: 0.9, opacity: 0.3 }
            }
            transition={
              isLosing
                ? { duration: 0.5, ease: "easeOut" }
                : { type: "spring", stiffness: 300, damping: 20 }
            }
          >
            <Heart
              size={iconSize}
              className={
                isFilled
                  ? "text-primary fill-primary"
                  : "text-fresh-sage fill-fresh-sage/30"
              }
            />
          </motion.div>
        );
      })}

      {showCount && (
        <motion.span
          className="ml-2 font-bold text-primary"
          animate={current !== prevCurrent ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {current}
        </motion.span>
      )}
    </div>
  );
}

// Hook for managing hearts state
export function useHearts(initialHearts = 5, maxHearts = 5) {
  const [state, setState] = useState<HeartsState>({
    current: initialHearts,
    max: maxHearts,
  });

  const loseHeart = () => {
    setState((prev) => ({
      ...prev,
      current: Math.max(0, prev.current - 1),
    }));
  };

  const gainHeart = () => {
    setState((prev) => ({
      ...prev,
      current: Math.min(prev.max, prev.current + 1),
    }));
  };

  const resetHearts = () => {
    setState((prev) => ({
      ...prev,
      current: prev.max,
    }));
  };

  const setHearts = (hearts: number) => {
    setState((prev) => ({
      ...prev,
      current: Math.min(prev.max, Math.max(0, hearts)),
    }));
  };

  return {
    ...state,
    loseHeart,
    gainHeart,
    resetHearts,
    setHearts,
    isEmpty: state.current === 0,
    isFull: state.current === state.max,
  };
}
