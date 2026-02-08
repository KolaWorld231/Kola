"use client";

import { motion } from "framer-motion";
import { AnimatedProgressBar } from "@/components/gamification/AnimatedProgressBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Play } from "lucide-react";
import type { LessonProgress } from "@/types/gamification";

interface EnhancedLessonCardProps extends LessonProgress {
  onClick?: () => void;
  showSound?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

export function EnhancedLessonCard({
  id,
  title,
  description,
  progress,
  isComplete,
  isLocked,
  onClick,
  showSound = true,
}: EnhancedLessonCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={!isLocked ? "hover" : undefined}
      className="h-full"
    >
      <Card
        className={`h-full cursor-pointer transition-all border-2 ${
          isLocked
            ? "bg-muted border-border opacity-60 cursor-not-allowed"
            : isComplete
            ? "border-fresh-green/40 bg-fresh-green/5 hover:border-fresh-green/60"
            : "border-fresh-blue/40 bg-fresh-blue/5 hover:border-fresh-blue/60"
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg text-fresh-dark flex items-center gap-2">
                {title}
                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-fresh-green" />
                  </motion.div>
                )}
              </CardTitle>
              <CardDescription className="text-fresh-brown text-sm">
                {description}
              </CardDescription>
            </div>
            {isLocked && (
              <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {!isLocked && (
            <AnimatedProgressBar
              value={progress}
              max={100}
              variant={isComplete ? "success" : "lesson"}
              showPercentage={true}
              size="sm"
            />
          )}

          {/* CTA Button */}
          {!isLocked && (
            <Button
              onClick={onClick}
              className="w-full bg-fresh-blue hover:bg-fresh-blue text-white font-semibold"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              {isComplete ? "Review" : "Start"}
            </Button>
          )}

          {isLocked && (
            <Button disabled className="w-full" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Unlock Next Lesson
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
