"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Target, Flame, Medal, Award } from "lucide-react";
import { useConfetti } from "@/components/animations/Confetti";
import { sounds } from "@/lib/sounds";

type AchievementType =
  | "lesson_complete"
  | "streak"
  | "level_up"
  | "perfect_score"
  | "first_lesson"
  | "milestone";

interface AchievementToastProps {
  type: AchievementType;
  title: string;
  description?: string;
  isVisible?: boolean;
  onClose?: () => void;
  autoHideDuration?: number;
  className?: string;
}

const achievementConfig: Record<
  AchievementType,
  {
    icon: typeof Trophy;
    gradient: string;
    iconColor: string;
  }
> = {
  lesson_complete: {
    icon: Target,
    gradient: "from-kola-accent to-green-600",
    iconColor: "text-white",
  },
  streak: {
    icon: Flame,
    gradient: "from-orange-400 to-red-500",
    iconColor: "text-white",
  },
  level_up: {
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    iconColor: "text-white",
  },
  perfect_score: {
    icon: Trophy,
    gradient: "from-purple-400 to-purple-600",
    iconColor: "text-white",
  },
  first_lesson: {
    icon: Medal,
    gradient: "from-kola-primary to-blue-600",
    iconColor: "text-white",
  },
  milestone: {
    icon: Award,
    gradient: "from-pink-400 to-rose-500",
    iconColor: "text-white",
  },
};

export function AchievementToast({
  type,
  title,
  description,
  isVisible = true,
  onClose,
  autoHideDuration = 5000,
  className = "",
}: AchievementToastProps) {
  const { fireBurst } = useConfetti();
  const config = achievementConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible) {
      sounds.levelup();
      fireBurst();

      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          onClose?.();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoHideDuration, onClose, fireBurst]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50
            ${className}
          `}
        >
          <div className="relative overflow-hidden rounded-2xl bg-kola-cream shadow-2xl border border-kola-accent">
            {/* Gradient header */}
            <div className={`bg-gradient-to-r ${config.gradient} px-6 py-3`}>
              <div className="flex items-center gap-3">
                {/* Animated icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                >
                  <Icon className={config.iconColor} size={28} />
                </motion.div>

                <div>
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-sm font-medium uppercase tracking-wide"
                  >
                    Achievement Unlocked!
                  </motion.p>
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white font-bold text-lg"
                  >
                    {title}
                  </motion.h3>
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="px-6 py-3"
              >
                <p className="text-kola-bronze text-sm">{description}</p>
              </motion.div>
            )}

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 1.5,
                delay: 0.5,
                ease: "easeInOut",
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <span className="text-white text-sm">×</span>
            </button>

            {/* Sparkle decorations */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-yellow-300"
                style={{
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
