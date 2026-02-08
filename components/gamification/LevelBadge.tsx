"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Crown, Trophy } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLevelUp?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { badge: "w-10 h-10", text: "text-sm", icon: 12 },
  md: { badge: "w-14 h-14", text: "text-lg", icon: 16 },
  lg: { badge: "w-20 h-20", text: "text-2xl", icon: 20 },
};

// Get badge color based on level
const getBadgeStyle = (level: number) => {
  if (level >= 50) {
    return {
      bg: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600",
      border: "border-yellow-300",
      text: "text-yellow-900",
      icon: Crown,
      glow: "shadow-yellow-400/50",
    };
  }
  if (level >= 25) {
    return {
      bg: "bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600",
      border: "border-purple-300",
      text: "text-white",
      icon: Trophy,
      glow: "shadow-purple-400/50",
    };
  }
  if (level >= 10) {
    return {
      bg: "bg-gradient-to-br from-fresh-blue via-blue-500 to-blue-600",
      border: "border-fresh-blue/50",
      text: "text-white",
      icon: Star,
      glow: "shadow-fresh-blue/50",
    };
  }
  return {
    bg: "bg-gradient-to-br from-fresh-green via-green-500 to-green-600",
    border: "border-fresh-green/50",
    text: "text-white",
    icon: Star,
    glow: "shadow-fresh-green/50",
  };
};

export function LevelBadge({
  level,
  size = "md",
  showLevelUp = false,
  className = "",
}: LevelBadgeProps) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);
  const styles = sizeClasses[size];
  const badgeStyle = getBadgeStyle(level);
  const IconComponent = badgeStyle.icon;

  useEffect(() => {
    if (level > prevLevel) {
      setIsLevelingUp(true);
      sounds.levelup();
      
      setTimeout(() => {
        setIsLevelingUp(false);
      }, 2000);
    }
    setPrevLevel(level);
  }, [level, prevLevel]);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          ${styles.badge} rounded-full flex items-center justify-center
          ${badgeStyle.bg} ${badgeStyle.border} border-2
          shadow-lg ${badgeStyle.glow}
          relative overflow-hidden
        `}
        animate={
          isLevelingUp
            ? {
                rotateY: [0, 180, 360],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{
          duration: 0.8,
          ease: "easeInOut",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Level number */}
        <span className={`font-bold ${styles.text} ${badgeStyle.text} relative z-10`}>
          {level}
        </span>

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "linear",
          }}
        />

        {/* Icon decorations */}
        <IconComponent
          size={styles.icon}
          className={`absolute top-0.5 right-0.5 ${badgeStyle.text} opacity-50`}
        />
      </motion.div>

      {/* Level up celebration */}
      <AnimatePresence>
        {isLevelingUp && showLevelUp && (
          <>
            {/* Burst particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-yellow-400"
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: Math.cos((i * Math.PI) / 4) * 40,
                  y: Math.sin((i * Math.PI) / 4) * 40,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}

            {/* Level up text */}
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                LEVEL UP! 🎉
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
