"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  preloadSounds,
  setVolume,
  getVolume,
  setMuted,
  isSoundMuted,
  toggleMute,
  playSound,
} from "@/lib/sounds";
import type { SoundEffect } from "@/types/gamification";

interface SoundContextValue {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  playSound: (effect: SoundEffect) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMutedState] = useState(false);

  // Preload sounds on mount
  useEffect(() => {
    // Check for user preference
    const savedVolume = localStorage.getItem("kola-sound-volume");
    const savedMuted = localStorage.getItem("kola-sound-muted");

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolumeState(vol);
      setVolume(vol);
    }

    if (savedMuted === "true") {
      setIsMutedState(true);
      setMuted(true);
    }

    // Preload sounds after a short delay
    const timer = setTimeout(() => {
      preloadSounds();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSetVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    setVolume(newVolume);
    localStorage.setItem("kola-sound-volume", String(newVolume));
  };

  const handleToggleMute = () => {
    const newMuted = toggleMute();
    setIsMutedState(newMuted);
    localStorage.setItem("kola-sound-muted", String(newMuted));
  };

  return (
    <SoundContext.Provider
      value={{
        volume,
        isMuted,
        setVolume: handleSetVolume,
        toggleMute: handleToggleMute,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
