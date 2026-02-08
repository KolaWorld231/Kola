"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import type { AnimationDirection } from "@/types/gamification";

interface SlideInProps {
  children: ReactNode;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
}

const getVariants = (direction: AnimationDirection, distance: number): Variants => {
  const offsets: Record<AnimationDirection, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  return {
    hidden: { opacity: 0, ...offsets[direction] },
    visible: { opacity: 1, x: 0, y: 0 },
  };
};

export function SlideIn({
  children,
  direction = "up",
  duration = 0.5,
  delay = 0,
  distance = 30,
  className,
}: SlideInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getVariants(direction, distance)}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Smooth ease-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
