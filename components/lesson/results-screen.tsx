"use client";

import { motion } from "framer-motion";
import { MascotReactions } from "@/components/mascot";
import { AchievementToast } from "@/components/feedback/AchievementToast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfetti } from "@/components/animations";
import { AnimatedProgressBar } from "@/components/gamification";
import { Trophy, Star, Zap, Award } from "lucide-react";
import Link from "next/link";

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  newLevel?: boolean;
  levelNumber?: number;
  onContinue?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function ResultsScreen({
  score,
  totalQuestions,
  xpEarned,
  newLevel = false,
  levelNumber = 1,
  onContinue,
}: ResultsScreenProps) {
  const percentage = (score / totalQuestions) * 100;
  const isUnderline = score >= totalQuestions * 0.7;
  const { fire, fireBurst } = useConfetti();

  // Trigger confetti on mount
  React.useEffect(() => {
    if (isUnderline) {
      fire({ particleCount: 150, spread: 80 });
    }
  }, []);

  return (
    <div className="min-h-screen bg-fresh-cream py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Mascot Celebration */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <MascotReactions
              mood={isUnderline ? "celebrating" : "encouraging"}
              message={
                isUnderline
                  ? "Excellent! You nailed it! 🎉"
                  : "Good effort! Keep practicing!"
              }
              size="lg"
            />
          </motion.div>

          {/* Score Card */}
          <motion.div variants={itemVariants}>
            <Card className="border-fresh-green/40 bg-gradient-to-br from-fresh-green/5 to-fresh-green/10 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-fresh-dark">Your Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Percentage */}
                <div className="text-center">
                  <motion.div
                    className="inline-flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-6xl font-bold text-fresh-green">
                      {percentage.toFixed(0)}%
                    </span>
                  </motion.div>
                  <p className="text-fresh-brown mt-2 text-lg font-medium">
                    {score} out of {totalQuestions} correct
                  </p>
                </div>

                {/* Progress Bar */}
                <AnimatedProgressBar
                  value={score}
                  max={totalQuestions}
                  variant="success"
                  size="lg"
                  showLabel={true}
                  label="Correct Answers"
                />

                {/* XP Earned */}
                <div className="p-4 rounded-lg bg-fresh-blue/10 border border-fresh-blue/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-fresh-blue" />
                      <span className="font-semibold text-fresh-dark">XP Earned</span>
                    </div>
                    <motion.span
                      className="text-2xl font-bold text-fresh-blue"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ delay: 0.5, duration: 1 }}
                    >
                      +{xpEarned}
                    </motion.span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          {isUnderline && (
            <motion.div variants={itemVariants}>
              <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-accent/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-fresh-dark">
                    <Trophy className="h-5 w-5 text-accent" />
                    Achievements Unlocked
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.div
                    className="p-3 rounded-lg bg-fresh-green/10 border border-fresh-green/30 flex items-center gap-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="h-5 w-5 text-fresh-green flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-fresh-dark">Perfect Score!</p>
                      <p className="text-sm text-fresh-brown">
                        {score === totalQuestions ? "You got every question correct!" : "Great performance!"}
                      </p>
                    </div>
                  </motion.div>

                  {newLevel && (
                    <motion.div
                      className="p-3 rounded-lg bg-fresh-blue/10 border border-fresh-blue/30 flex items-center gap-3"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    >
                      <Award className="h-5 w-5 text-fresh-blue flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-fresh-dark">Level Up!</p>
                        <p className="text-sm text-fresh-brown">
                          You've reached level {levelNumber}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-fresh-blue hover:bg-fresh-blue text-white font-semibold"
              >
                Back to Dashboard
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onContinue?.()}
              className="border-fresh-green text-fresh-green hover:bg-fresh-green/10"
            >
              Try Again
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Add React import for useEffect
import React from "react";
