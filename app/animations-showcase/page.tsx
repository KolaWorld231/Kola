"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  Confetti,
  useConfetti,
  NumberCounter,
  StaggerChildren,
  StaggerItem,
} from "@/components/animations";
import {
  PepperBird,
  MascotReactions,
  useMascotReactions,
} from "@/components/mascot";
import {
  XPCounter,
  AnimatedProgressBar,
  Hearts,
  useHearts,
  StreakFire,
  useStreak,
  LevelBadge,
} from "@/components/gamification";
import { AnswerFeedback } from "@/components/feedback/AnswerFeedback";
import { AchievementToast } from "@/components/feedback/AchievementToast";
import { LessonCard } from "@/components/cards/LessonCard";
import { KolaLoader } from "@/components/loading/KolaLoader";
import { Button } from "@/components/ui/button";
import type { MascotMood, FeedbackType, LessonProgress } from "@/types/gamification";

export default function AnimationsShowcase() {
  const { fire, fireBurst, fireStars } = useConfetti();
  const mascot = useMascotReactions();
  const hearts = useHearts(3, 5);
  const streak = useStreak(7);

  const [showConfetti, setShowConfetti] = useState(false);
  const [xp, setXp] = useState(1250);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [achievement, setAchievement] = useState(false);
  const [level, setLevel] = useState(5);

  const mockLessons: LessonProgress[] = [
    {
      id: "1",
      title: "Greetings",
      description: "Learn basic greetings in Liberian English",
      progress: 100,
      isComplete: true,
      isLocked: false,
    },
    {
      id: "2",
      title: "Numbers",
      description: "Count from 1 to 100",
      progress: 65,
      isComplete: false,
      isLocked: false,
    },
    {
      id: "3",
      title: "Colors",
      description: "Learn colors and descriptions",
      progress: 0,
      isComplete: false,
      isLocked: false,
    },
    {
      id: "4",
      title: "Advanced Phrases",
      description: "Complex sentence structures",
      progress: 0,
      isComplete: false,
      isLocked: true,
    },
  ];

  const mascotMoods: MascotMood[] = ["happy", "celebrating", "encouraging", "sleeping", "thinking"];

  return (
    <div className="min-h-screen bg-fresh-cream">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-fresh-cream/95 backdrop-blur-sm border-b border-fresh-sage shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-fresh-dark">Kola Animations Showcase</h1>
          <p className="text-fresh-brown mt-1">Complete animated UI/UX system for language learning</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Section 1: Mascot */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">🎭 Mascot System</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interactive Mascot */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Interactive Pepper Bird</h3>
              <div className="flex flex-col items-center gap-6">
                <MascotReactions
                  mood={mascot.state.mood}
                  message={mascot.state.message}
                  size="lg"
                />
                <div className="grid grid-cols-2 gap-2 w-full">
                  {mascotMoods.map((mood) => (
                    <Button
                      key={mood}
                      size="sm"
                      variant={mascot.state.mood === mood ? "default" : "outline"}
                      onClick={() => mascot.setMood(mood)}
                      className="text-xs"
                    >
                      {mood}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* All Moods */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">All Mood States</h3>
              <div className="grid grid-cols-3 gap-4">
                {mascotMoods.map((mood) => (
                  <div key={mood} className="text-center">
                    <PepperBird mood={mood} size="md" />
                    <p className="text-xs font-medium text-fresh-brown mt-2 capitalize">
                      {mood}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Animations */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">✨ Animation Components</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FadeIn */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-4">FadeIn</h3>
              <FadeIn>
                <div className="bg-fresh-green/20 text-fresh-green px-4 py-6 rounded-lg text-center font-bold">
                  Fading in...
                </div>
              </FadeIn>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-4 w-full"
              >
                Reload to see
              </Button>
            </div>

            {/* SlideIn */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-4">SlideIn</h3>
              <SlideIn direction="up">
                <div className="bg-fresh-blue/20 text-fresh-blue px-4 py-6 rounded-lg text-center font-bold">
                  Sliding up...
                </div>
              </SlideIn>
            </div>

            {/* ScaleIn */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-4">ScaleIn</h3>
              <ScaleIn>
                <div className="bg-primary/20 text-primary px-4 py-6 rounded-lg text-center font-bold">
                  Scaling in...
                </div>
              </ScaleIn>
            </div>
          </div>
        </section>

        {/* Section 3: Gamification */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">🎮 Gamification</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* XP Counter */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">XP Counter</h3>
              <div className="space-y-4">
                <XPCounter value={xp} size="lg" />
                <Button
                  size="sm"
                  onClick={() => setXp(xp + 100)}
                  className="w-full"
                >
                  +100 XP
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Animated Progress</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-fresh-brown mb-2">Lesson Progress</p>
                  <AnimatedProgressBar value={65} variant="lesson" showPercentage />
                </div>
                <div>
                  <p className="text-sm font-medium text-fresh-brown mb-2">XP Progress</p>
                  <AnimatedProgressBar value={750} max={1000} variant="xp" showPercentage />
                </div>
              </div>
            </div>

            {/* Hearts */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Hearts System</h3>
              <div className="space-y-4">
                <Hearts current={hearts.current} max={hearts.max} size="lg" showCount />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={hearts.loseHeart}
                    className="flex-1"
                  >
                    -Heart
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={hearts.gainHeart}
                    className="flex-1"
                  >
                    +Heart
                  </Button>
                </div>
              </div>
            </div>

            {/* Streak Fire */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Streak Fire</h3>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <StreakFire days={streak.days} isActive={streak.isActive} size="lg" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={streak.incrementStreak}
                    className="flex-1"
                  >
                    +Day
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={streak.resetStreak}
                    className="flex-1"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Level Badge */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Level Badge</h3>
              <div className="space-y-4 flex flex-col items-center">
                <LevelBadge level={level} size="lg" showLevelUp />
                <Button
                  size="sm"
                  onClick={() => setLevel(level + 1)}
                  className="w-full"
                >
                  Level Up
                </Button>
              </div>
            </div>

            {/* Number Counter */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Number Counter</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <NumberCounter
                    value={1250}
                    duration={2}
                    className="text-4xl font-bold text-fresh-green"
                    suffix=" XP"
                  />
                </div>
                <Button size="sm" onClick={() => window.location.reload()} className="w-full">
                  Reload to see animation
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Feedback */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">📢 Feedback & Confetti</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Answer Feedback */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Answer Feedback</h3>
              <div className="space-y-3">
                {(["correct", "wrong", "perfect", "streak"] as const).map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant="outline"
                    onClick={() => setFeedback(type)}
                    className="w-full capitalize"
                  >
                    Show {type}
                  </Button>
                ))}
              </div>
              {feedback && (
                <AnswerFeedback
                  type={feedback}
                  isVisible
                  onComplete={() => setFeedback(null)}
                  className="mt-4"
                />
              )}
            </div>

            {/* Confetti Effects */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
              <h3 className="font-bold text-fresh-dark mb-6">Confetti Effects</h3>
              <div className="space-y-3">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    fire({ particleCount: 100, spread: 70 });
                  }}
                >
                  Default Confetti
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={fireBurst}
                >
                  Burst Confetti
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={fireStars}
                >
                  Stars Confetti
                </Button>
              </div>
            </div>

            {/* Achievement Toast */}
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md lg:col-span-2">
              <h3 className="font-bold text-fresh-dark mb-6">Achievement Toast</h3>
              <Button
                size="sm"
                onClick={() => setAchievement(true)}
                className="w-full sm:w-auto"
              >
                Show Achievement
              </Button>
              {achievement && (
                <AchievementToast
                  type="level_up"
                  title="Level 10 Reached!"
                  description="You've mastered the basics. Great progress!"
                  isVisible
                  onClose={() => setAchievement(false)}
                />
              )}
            </div>
          </div>
        </section>

        {/* Section 5: Lesson Cards */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">📚 Lesson Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                {...lesson}
                onClick={() => mascot.celebrate()}
              />
            ))}
          </div>
        </section>

        {/* Section 6: Loading */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">⏳ Loading States</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md flex items-center justify-center min-h-[300px]">
              <KolaLoader size="sm" showText />
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md flex items-center justify-center min-h-[300px]">
              <KolaLoader size="md" showText />
            </div>
            <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md flex items-center justify-center min-h-[300px]">
              <KolaLoader size="lg" showText={false} />
            </div>
          </div>
        </section>

        {/* Section 7: Stagger Animation */}
        <section>
          <h2 className="text-2xl font-bold text-fresh-dark mb-6">🎬 Staggered Animations</h2>
          <div className="bg-white rounded-2xl p-8 border-2 border-fresh-sage shadow-md">
            <StaggerChildren staggerDelay={0.1} className="space-y-3">
              {["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="bg-fresh-blue/10 text-fresh-blue px-4 py-3 rounded-lg font-medium">
                    {item}
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>
            <Button size="sm" onClick={() => window.location.reload()} className="mt-4 w-full">
              Reload to see animation
            </Button>
          </div>
        </section>

        {/* Footer */}
        <section className="py-12 text-center">
          <p className="text-fresh-brown">
            🎉 All animations in this showcase are production-ready!
          </p>
          <p className="text-sm text-fresh-brown/70 mt-2">
            Sound effects are enabled with volume control via the SoundProvider
          </p>
        </section>
      </div>
    </div>
  );
}
