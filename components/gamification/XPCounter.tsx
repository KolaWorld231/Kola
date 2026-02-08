"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { sounds } from "@/lib/sounds";

interface XPCounterProps {
  value: number;
  showGain?: boolean;
  gainAmount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm px-2 py-1",
  md: "text-base px-3 py-1.5",
  lg: "text-lg px-4 py-2",
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function XPCounter({
  value,
  showGain = false,
  gainAmount = 0,
  size = "md",
  className = "",
}: XPCounterProps) {
  const [displayGain, setDisplayGain] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  const spring = useSpring(value, {
    stiffness: 100,
    damping: 30,
  });

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  // Animate when value changes
  useEffect(() => {
    if (value !== prevValue) {
      spring.set(value);
      
      if (value > prevValue) {
        setDisplayGain(true);
        sounds.xp();
        
        setTimeout(() => {
          setDisplayGain(false);
        }, 1500);
      }
      
      setPrevValue(value);
    }
  }, [value, prevValue, spring]);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <motion.div
        className={`
          inline-flex items-center gap-1.5 rounded-full
          bg-fresh-green/10 text-fresh-green font-bold
          border border-fresh-green/30
          ${sizeClasses[size]}
        `}
        animate={displayGain ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Sparkles size={iconSizes[size]} className="text-fresh-green" />
        <motion.span>{display}</motion.span>
        <span className="text-fresh-green/70 font-medium">XP</span>
      </motion.div>

      {/* XP Gain popup */}
      <AnimatePresence>
        {displayGain && gainAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
            className="absolute -top-2 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <span className="text-kola-accent font-bold text-lg whitespace-nowrap">
              +{gainAmount} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
