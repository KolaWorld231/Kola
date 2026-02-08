"use client";

import { motion } from "framer-motion";

interface VoloLoaderProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { letter: "text-2xl", gap: "gap-1" },
  md: { letter: "text-4xl", gap: "gap-2" },
  lg: { letter: "text-6xl", gap: "gap-3" },
};

const letters = ["V", "O", "L", "O"];

const letterColors = [
  "text-fresh-green",   // V
  "text-fresh-blue",    // O
  "text-primary",       // L
  "text-accent",        // O
];

export function VoloLoader({
  size = "md",
  showText = true,
  className = "",
}: VoloLoaderProps) {
  const styles = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Dancing letters */}
      <div className={`flex items-end ${styles.gap}`}>
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            className={`
              ${styles.letter} font-bold ${letterColors[index]}
              drop-shadow-lg
            `}
            initial={{ y: 0 }}
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 0.8,
              delay: index * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Loading dots */}
      {showText && (
        <div className="flex items-center gap-1 mt-4">
          <span className="text-fresh-brown text-sm">Loading</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-fresh-blue"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Circular progress indicator */}
      <motion.div
        className="mt-6 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <svg className="w-12 h-12" viewBox="0 0 50 50">
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-fresh-sage"
          />
          {/* Animated arc */}
          <motion.circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-fresh-blue"
            strokeDasharray="125"
            strokeDashoffset="125"
            animate={{
              strokeDashoffset: [125, 0, 125],
              rotate: [0, 360],
            }}
            transition={{
              strokeDashoffset: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              },
            }}
            style={{ transformOrigin: "center" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

// Full page loader variant
export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fresh-cream/95 backdrop-blur-sm">
      <VoloLoader size="lg" />
    </div>
  );
}
