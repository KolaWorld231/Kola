"use client";

import { useEffect, useState } from "react";
import { MascotReactions } from "@/components/mascot";
import type { MascotMood } from "@/types/gamification";

interface MascotGreetingProps {
  userName?: string;
  currentXP?: number;
  streak?: number;
  className?: string;
}

export function MascotGreeting({
  userName = "Learner",
  currentXP = 0,
  streak = 0,
  className = "",
}: MascotGreetingProps) {
  const [mood, setMood] = useState<MascotMood>("happy");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Determine mood based on user stats
    if (streak > 7) {
      setMood("celebrating");
      setMessage("You're on fire! 🔥");
    } else if (streak > 0) {
      setMood("encouraging");
      setMessage("Keep up the streak!");
    } else if (currentXP > 500) {
      setMood("happy");
      setMessage(`Great progress, ${userName}!`);
    } else {
      setMood("happy");
      setMessage(`Welcome back, ${userName}!`);
    }
  }, [currentXP, streak, userName]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <MascotReactions 
        mood={mood}
        message={message}
        size="lg"
        autoIdle={true}
        idleTimeout={30000}
      />
    </div>
  );
}
