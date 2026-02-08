"use client";

import { useState, useEffect, useCallback } from "react";
import { PepperBird } from "./PepperBird";
import { SpeechBubble } from "./SpeechBubble";
import type { MascotMood, MascotState } from "@/types/gamification";

interface MascotReactionsProps {
  mood?: MascotMood;
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  autoIdle?: boolean;
  idleTimeout?: number;
  className?: string;
}

const IDLE_MESSAGES = [
  "Keep going! 💪",
  "You're doing great!",
  "Learning is fun!",
  "Practice makes perfect!",
];

const MOOD_MESSAGES: Record<MascotMood, string[]> = {
  happy: ["Great job!", "Awesome!", "You're on fire! 🔥", "Keep it up!"],
  celebrating: ["AMAZING! 🎉", "Perfect score!", "You nailed it!", "Champion! 🏆"],
  encouraging: ["Don't give up!", "You can do it!", "Try again!", "Almost there!"],
  sleeping: ["Zzz...", "💤", "..."],
  thinking: ["Hmm...", "Let me think...", "🤔"],
};

export function MascotReactions({
  mood: propMood,
  message: propMessage,
  size = "md",
  autoIdle = true,
  idleTimeout = 30000,
  className = "",
}: MascotReactionsProps) {
  const [state, setState] = useState<MascotState>({
    mood: propMood || "happy",
    message: propMessage,
  });
  const [showBubble, setShowBubble] = useState(!!propMessage);

  // Update state when props change
  useEffect(() => {
    if (propMood) {
      setState((prev) => ({ ...prev, mood: propMood }));
    }
    if (propMessage !== undefined) {
      setState((prev) => ({ ...prev, message: propMessage }));
      setShowBubble(!!propMessage);
    }
  }, [propMood, propMessage]);

  // Auto-hide speech bubble
  useEffect(() => {
    if (showBubble && state.message) {
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showBubble, state.message]);

  // Auto-idle functionality
  useEffect(() => {
    if (!autoIdle) return;

    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (state.mood === "sleeping") {
        setState({ mood: "happy", message: undefined });
      }
      idleTimer = setTimeout(() => {
        setState({ mood: "sleeping", message: "Zzz..." });
        setShowBubble(true);
      }, idleTimeout);
    };

    // Listen for user activity
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [autoIdle, idleTimeout, state.mood]);

  // React to answer
  const reactToAnswer = useCallback((isCorrect: boolean) => {
    const mood: MascotMood = isCorrect ? "celebrating" : "encouraging";
    const messages = MOOD_MESSAGES[mood];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    setState({ mood, message });
    setShowBubble(true);

    // Return to happy state after celebration
    setTimeout(() => {
      setState({ mood: "happy", message: undefined });
    }, 3000);
  }, []);

  // React to level up
  const reactToLevelUp = useCallback(() => {
    setState({ mood: "celebrating", message: "LEVEL UP! 🎉" });
    setShowBubble(true);

    setTimeout(() => {
      setState({ mood: "happy", message: undefined });
    }, 4000);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <PepperBird mood={state.mood} size={size} />
      <SpeechBubble isVisible={showBubble} position="right">
        {state.message}
      </SpeechBubble>
    </div>
  );
}

// Export helper hook for controlling mascot externally
export function useMascotReactions() {
  const [state, setState] = useState<MascotState>({ mood: "happy" });

  const setMood = useCallback((mood: MascotMood, message?: string) => {
    setState({ mood, message });
  }, []);

  const celebrate = useCallback(() => {
    const messages = MOOD_MESSAGES.celebrating;
    setState({
      mood: "celebrating",
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  }, []);

  const encourage = useCallback(() => {
    const messages = MOOD_MESSAGES.encouraging;
    setState({
      mood: "encouraging",
      message: messages[Math.floor(Math.random() * messages.length)],
    });
  }, []);

  const think = useCallback(() => {
    setState({ mood: "thinking", message: "Hmm..." });
  }, []);

  const reset = useCallback(() => {
    setState({ mood: "happy", message: undefined });
  }, []);

  return {
    state,
    setMood,
    celebrate,
    encourage,
    think,
    reset,
  };
}
