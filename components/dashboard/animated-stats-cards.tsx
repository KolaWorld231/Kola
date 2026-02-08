"use client";

import { motion } from "framer-motion";
import { XPCounter, Hearts, StreakFire, LevelBadge } from "@/components/gamification";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AnimatedStatsCardsProps {
  xp: number;
  hearts: number;
  maxHearts: number;
  streak: number;
  level: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function AnimatedStatsCards({
  xp,
  hearts,
  maxHearts,
  streak,
  level,
  className = "",
}: AnimatedStatsCardsProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* XP Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-fresh-green/5 to-fresh-green/10 border-fresh-green/20 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-fresh-brown uppercase tracking-wide">
              Total XP
            </span>
            <XPCounter value={xp} size="lg" />
          </div>
        </Card>
      </motion.div>

      {/* Streak Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-fresh-blue/5 to-fresh-blue/10 border-fresh-blue/20 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-fresh-brown uppercase tracking-wide">
              Streak
            </span>
            <StreakFire days={streak} isActive={streak > 0} size="lg" />
          </div>
        </Card>
      </motion.div>

      {/* Hearts Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-fresh-brown uppercase tracking-wide">
              Lives
            </span>
            <Hearts 
              current={hearts} 
              max={maxHearts} 
              size="lg" 
              showCount
            />
          </div>
        </Card>
      </motion.div>

      {/* Level Card */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 hover:shadow-lg transition-shadow">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-semibold text-fresh-brown uppercase tracking-wide">
              Level
            </span>
            <LevelBadge level={level} size="lg" showLevelUp={false} />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
