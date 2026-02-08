"use client";

import { motion } from "framer-motion";
import { EnhancedLessonCard } from "./enhanced-lesson-card";
import type { LessonProgress } from "@/types/gamification";

interface LessonGridProps {
  lessons: LessonProgress[];
  onLessonClick?: (lessonId: string) => void;
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

export function LessonGrid({
  lessons,
  onLessonClick,
  className = "",
}: LessonGridProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {lessons.map((lesson) => (
        <EnhancedLessonCard
          key={lesson.id}
          {...lesson}
          onClick={() => onLessonClick?.(lesson.id)}
        />
      ))}
    </motion.div>
  );
}
