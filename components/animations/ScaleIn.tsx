"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface ScaleInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  initialScale?: number;
  className?: string;
}

const getVariants = (initialScale: number): Variants => ({
  hidden: { opacity: 0, scale: initialScale },
  visible: { opacity: 1, scale: 1 },
});

export function ScaleIn({
  children,
  duration = 0.4,
  delay = 0,
  initialScale = 0.8,
  className,
}: ScaleInProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={getVariants(initialScale)}
      transition={{
        duration,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
