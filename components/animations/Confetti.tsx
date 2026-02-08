"use client";

import { useCallback, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  colors?: string[];
  origin?: { x: number; y: number };
}

const DEFAULT_COLORS = [
  "#6E8658", // fresh-green
  "#73A1B2", // fresh-blue
  "#D0D5CE", // fresh-sage
  "#F3C24F", // sun-gold
  "#D63A3A", // liberian-red
];

export function useConfetti() {
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      particleCount = 100,
      spread = 70,
      startVelocity = 30,
      decay = 0.95,
      gravity = 1,
      colors = DEFAULT_COLORS,
      origin = { x: 0.5, y: 0.6 },
    } = options;

    confetti({
      particleCount,
      spread,
      startVelocity,
      decay,
      gravity,
      colors,
      origin,
      disableForReducedMotion: true,
    });
  }, []);

  const fireBurst = useCallback(() => {
    // Fire from multiple angles for a celebration effect
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: DEFAULT_COLORS,
      disableForReducedMotion: true,
    };

    function fireConfetti(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fireConfetti(0.25, { spread: 26, startVelocity: 55 });
    fireConfetti(0.2, { spread: 60 });
    fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fireConfetti(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
      disableForReducedMotion: true,
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  return { fire, fireBurst, fireStars };
}

interface ConfettiProps {
  trigger?: boolean;
  type?: "default" | "burst" | "stars";
  onComplete?: () => void;
}

export function Confetti({ trigger, type = "default", onComplete }: ConfettiProps) {
  const { fire, fireBurst, fireStars } = useConfetti();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (trigger && !hasTriggered.current) {
      hasTriggered.current = true;
      
      switch (type) {
        case "burst":
          fireBurst();
          break;
        case "stars":
          fireStars();
          break;
        default:
          fire();
      }
      
      // Reset after a delay and call onComplete
      setTimeout(() => {
        hasTriggered.current = false;
        onComplete?.();
      }, 3000);
    }
  }, [trigger, type, fire, fireBurst, fireStars, onComplete]);

  return null;
}
