"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

interface SpeechBubbleProps {
  children: ReactNode;
  isVisible?: boolean;
  position?: "top" | "right" | "bottom" | "left";
  className?: string;
}

const positionClasses = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
};

const tailClasses = {
  top: "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-kola-cream",
  right: "left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-kola-cream",
  bottom: "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-kola-cream",
  left: "right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-kola-cream",
};

export function SpeechBubble({
  children,
  isVisible = true,
  position = "top",
  className = "",
}: SpeechBubbleProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={`absolute z-10 ${positionClasses[position]} ${className}`}
        >
          <div className="relative bg-kola-cream text-kola-deep px-4 py-2 rounded-2xl shadow-lg border-2 border-kola-accent">
            <span className="text-sm font-medium whitespace-nowrap">{children}</span>
            <div className={`absolute w-0 h-0 ${tailClasses[position]}`} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
