"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  duration?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  duration = 0.3,
  className,
}: StaggerChildrenProps) {
  const customContainerVariants: Variants = {
    ...containerVariants,
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const customItemVariants: Variants = {
    ...itemVariants,
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        duration,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export item variants for use in child components
export { itemVariants as staggerItemVariants };

// Wrapper for individual stagger items
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
