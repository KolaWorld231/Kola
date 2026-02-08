"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Zap } from "lucide-react";
import { useConfetti } from "@/components/animations/Confetti";
import { sounds } from "@/lib/sounds";
import type { FeedbackType } from "@/types/gamification";

interface AnswerFeedbackProps {
  type: FeedbackType | null;
  message?: string;
  isVisible?: boolean;
  onComplete?: () => void;
  className?: string;
}

const feedbackConfig: Record<
  FeedbackType,
  {
    icon: typeof Check;
    bgColor: string;
    textColor: string;
    borderColor: string;
    defaultMessage: string;
    sound: () => void;
  }
> = {
  correct: {
    icon: Check,
    bgColor: "bg-fresh-green/10",
    textColor: "text-fresh-green",
    borderColor: "border-fresh-green/30",
    defaultMessage: "Correct!",
    sound: sounds.correct,
  },
  wrong: {
    icon: X,
    bgColor: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/30",
    defaultMessage: "Oops! Try again",
    sound: sounds.wrong,
  },
  perfect: {
    icon: Sparkles,
    bgColor: "bg-gradient-to-r from-yellow-500/10 to-orange-500/10",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-400/30",
    defaultMessage: "Perfect! 🌟",
    sound: sounds.correct,
  },
  streak: {
    icon: Zap,
    bgColor: "bg-gradient-to-r from-orange-500/10 to-red-500/10",
    textColor: "text-orange-600",
    borderColor: "border-orange-400/30",
    defaultMessage: "You're on fire! 🔥",
    sound: sounds.streak,
  },
};

export function AnswerFeedback({
  type,
  message,
  isVisible = true,
  onComplete,
  className = "",
}: AnswerFeedbackProps) {
  const { fire, fireBurst, fireStars } = useConfetti();

  useEffect(() => {
    if (type && isVisible) {
      const config = feedbackConfig[type];
      config.sound();

      // Trigger confetti for positive feedback
      if (type === "correct") {
        fire({ particleCount: 50, spread: 60 });
      } else if (type === "perfect") {
        fireStars();
      } else if (type === "streak") {
        fireBurst();
      }

      // Auto-dismiss after delay
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [type, isVisible, fire, fireBurst, fireStars, onComplete]);

  if (!type) return null;

  const config = feedbackConfig[type];
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
          className={`
            inline-flex items-center gap-3 px-6 py-4 rounded-2xl
            ${config.bgColor} ${config.borderColor} border-2
            shadow-lg backdrop-blur-sm
            ${className}
          `}
        >
          {/* Icon with animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
              delay: 0.1,
            }}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${type === "wrong" ? "bg-primary/20" : "bg-fresh-green/20"}
              `}
            >
              <Icon className={config.textColor} size={24} />
            </div>
          </motion.div>

          {/* Message */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`font-bold text-lg ${config.textColor}`}
          >
            {displayMessage}
          </motion.span>

          {/* Shake animation for wrong answers */}
          {type === "wrong" && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/50"
              animate={{
                x: [0, -5, 5, -5, 5, 0],
              }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
