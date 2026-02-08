"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, BookOpen, Star } from "lucide-react";
import { AnimatedProgressBar } from "@/components/gamification/AnimatedProgressBar";
import { sounds } from "@/lib/sounds";
import type { LessonProgress } from "@/types/gamification";

interface LessonCardProps extends LessonProgress {
  onClick?: () => void;
  className?: string;
}

export function LessonCard({
  id,
  title,
  description,
  progress,
  isComplete,
  isLocked,
  icon,
  onClick,
  className = "",
}: LessonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLocked) return;

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    sounds.pop();

    setTimeout(() => {
      setRipple(null);
    }, 600);

    onClick?.();
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        ${isLocked 
          ? "bg-fresh-sage/30 cursor-not-allowed" 
          : "bg-fresh-cream cursor-pointer"
        }
        border-2 
        ${isComplete 
          ? "border-fresh-green" 
          : isLocked 
            ? "border-fresh-sage/50" 
            : "border-fresh-sage"
        }
        shadow-md
        ${className}
      `}
      whileHover={!isLocked ? { 
        y: -4, 
        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)" 
      } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Ripple effect */}
      {ripple && (
        <motion.div
          className="absolute rounded-full bg-fresh-blue/20 pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0 }}
          animate={{ 
            width: 300, 
            height: 300, 
            x: -150, 
            y: -150,
            opacity: [1, 0]
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      <div className="relative p-5">
        {/* Header with icon */}
        <div className="flex items-start gap-4">
          {/* Lesson icon */}
          <motion.div
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center
              ${isComplete 
                ? "bg-fresh-green/20" 
                : isLocked 
                  ? "bg-fresh-sage/50" 
                  : "bg-fresh-blue/20"
              }
            `}
            animate={isHovered && !isLocked ? { 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.05, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            {isComplete ? (
              <Check className="text-fresh-green" size={28} />
            ) : isLocked ? (
              <Lock className="text-fresh-brown/50" size={24} />
            ) : (
              <BookOpen className="text-fresh-blue" size={24} />
            )}
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 
              className={`
                font-bold text-lg truncate
                ${isLocked ? "text-fresh-brown/50" : "text-fresh-dark"}
              `}
            >
              {title}
            </h3>
            <p 
              className={`
                text-sm mt-0.5 line-clamp-2
                ${isLocked ? "text-fresh-brown/40" : "text-fresh-brown"}
              `}
            >
              {description}
            </p>
          </div>

          {/* Stars for completed lessons */}
          {isComplete && (
            <motion.div
              className="flex gap-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Star 
                    size={16} 
                    className="text-yellow-400 fill-yellow-400" 
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        {!isLocked && !isComplete && progress > 0 && (
          <div className="mt-4">
            <AnimatedProgressBar
              value={progress}
              variant="lesson"
              size="sm"
              showPercentage
            />
          </div>
        )}

        {/* Complete badge */}
        {isComplete && (
          <motion.div
            className="absolute top-0 right-0 bg-fresh-green text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl"
            initial={{ x: 50 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Complete!
          </motion.div>
        )}

        {/* Locked overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-fresh-sage/50 to-transparent pointer-events-none" />
        )}

        {/* Hover glow */}
        {!isLocked && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: isHovered 
                ? "inset 0 0 0 2px rgba(115, 161, 178, 0.5)" 
                : "inset 0 0 0 0px rgba(115, 161, 178, 0)",
            }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    </motion.div>
  );
}
