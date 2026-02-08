"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { StreakState } from "@/types/gamification";

interface StreakFireProps {
  days: number;
  isActive?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { icon: 20, text: "text-sm", padding: "px-2 py-1" },
  md: { icon: 28, text: "text-base", padding: "px-3 py-1.5" },
  lg: { icon: 36, text: "text-lg", padding: "px-4 py-2" },
};

export function StreakFire({
  days,
  isActive = true,
  size = "md",
  showLabel = true,
  className = "",
}: StreakFireProps) {
  const styles = sizeClasses[size];

  return (
    <motion.div
      className={`
        inline-flex items-center gap-1.5 rounded-full
        ${isActive ? "bg-orange-500/10" : "bg-fresh-sage/30"}
        ${styles.padding}
        ${className}
      `}
      initial={{ scale: 1 }}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="relative"
        animate={
          isActive
            ? {
                rotate: [-2, 2, -2],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame
          size={styles.icon}
          className={isActive ? "text-orange-500 fill-orange-400" : "text-fresh-sage"}
        />
        
        {/* Fire glow effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full bg-orange-400/30 blur-md -z-10"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      <motion.span
        className={`font-bold ${styles.text} ${
          isActive ? "text-orange-600" : "text-fresh-brown/50"
        }`}
        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      >
        {days}
      </motion.span>

      {showLabel && (
        <span
          className={`${styles.text} ${
            isActive ? "text-orange-500/80" : "text-fresh-brown/40"
          } font-medium`}
        >
          {days === 1 ? "day" : "days"}
        </span>
      )}

      {/* Particle effects for active streak */}
      {isActive && days >= 7 && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-orange-400"
              style={{
                left: `${30 + i * 10}%`,
                bottom: "60%",
              }}
              animate={{
                y: [-5, -20, -5],
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

// Hook for managing streak state
export function useStreak(initialDays = 0) {
  const [state, setState] = useState<StreakState>({
    days: initialDays,
    isActive: initialDays > 0,
  });

  const incrementStreak = () => {
    setState((prev) => ({
      days: prev.days + 1,
      isActive: true,
    }));
  };

  const resetStreak = () => {
    setState({
      days: 0,
      isActive: false,
    });
  };

  const setStreak = (days: number) => {
    setState({
      days: Math.max(0, days),
      isActive: days > 0,
    });
  };

  return {
    ...state,
    incrementStreak,
    resetStreak,
    setStreak,
  };
}

// Need to import useState
import { useState } from "react";
