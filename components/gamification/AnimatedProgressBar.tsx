"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  showPercentage?: boolean;
  label?: string;
  variant?: "default" | "success" | "xp" | "lesson";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    track: "bg-fresh-sage/50",
    bar: "bg-fresh-blue",
    shimmer: "from-transparent via-white/30 to-transparent",
  },
  success: {
    track: "bg-fresh-sage/50",
    bar: "bg-fresh-green",
    shimmer: "from-transparent via-white/30 to-transparent",
  },
  xp: {
    track: "bg-fresh-sage/50",
    bar: "bg-gradient-to-r from-fresh-green to-fresh-blue",
    shimmer: "from-transparent via-white/40 to-transparent",
  },
  lesson: {
    track: "bg-fresh-sage/50",
    bar: "bg-gradient-to-r from-primary to-primary-light",
    shimmer: "from-transparent via-white/30 to-transparent",
  },
};

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function AnimatedProgressBar({
  value,
  max = 100,
  showLabel = false,
  showPercentage = false,
  label,
  variant = "default",
  size = "md",
  animated = true,
  className = "",
}: AnimatedProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const styles = variantStyles[variant];

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {showLabel && label && (
            <span className="text-sm font-medium text-fresh-dark">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-fresh-brown">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full overflow-hidden rounded-full",
          styles.track,
          sizeStyles[size]
        )}
      >
        <motion.div
          className={cn(
            "h-full relative overflow-hidden rounded-full",
            styles.bar
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: animated ? 0.8 : 0,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {/* Shimmer effect */}
          {animated && percentage > 0 && (
            <motion.div
              className={cn(
                "absolute inset-0 bg-gradient-to-r",
                styles.shimmer
              )}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "linear",
              }}
            />
          )}

          {/* Liquid effect dots */}
          {animated && percentage > 10 && (
            <>
              <motion.div
                className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/30"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
