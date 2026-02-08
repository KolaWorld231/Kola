"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface NumberCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

export function NumberCounter({
  value,
  duration = 1,
  className,
  prefix = "",
  suffix = "",
  formatter = (v) => Math.round(v).toLocaleString(),
}: NumberCounterProps) {
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => formatter(current));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest}${suffix}`;
      }
    });
    return unsubscribe;
  }, [display, prefix, suffix]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formatter(0)}{suffix}
    </motion.span>
  );
}
