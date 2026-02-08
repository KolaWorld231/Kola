"use client";

import { Howl } from "howler";
import type { SoundEffect } from "@/types/gamification";

// Sound configuration
const SOUND_CONFIG: Record<SoundEffect, { src: string; volume: number }> = {
  pop: { src: "/sounds/pop.mp3", volume: 0.5 },
  correct: { src: "/sounds/correct.mp3", volume: 0.6 },
  wrong: { src: "/sounds/wrong.mp3", volume: 0.4 },
  levelup: { src: "/sounds/levelup.mp3", volume: 0.7 },
  xp: { src: "/sounds/xp.mp3", volume: 0.5 },
  streak: { src: "/sounds/streak.mp3", volume: 0.6 },
};

// Sound instances cache
const soundInstances: Partial<Record<SoundEffect, Howl>> = {};

// Global volume control
let globalVolume = 1;
let isMuted = false;

/**
 * Get or create a sound instance
 */
function getSound(effect: SoundEffect): Howl {
  if (!soundInstances[effect]) {
    const config = SOUND_CONFIG[effect];
    soundInstances[effect] = new Howl({
      src: [config.src],
      volume: config.volume * globalVolume,
      preload: true,
    });
  }
  return soundInstances[effect]!;
}

/**
 * Play a sound effect
 */
export function playSound(effect: SoundEffect): void {
  if (isMuted) return;
  
  try {
    const sound = getSound(effect);
    sound.volume(SOUND_CONFIG[effect].volume * globalVolume);
    sound.play();
  } catch (error) {
    console.warn(`Failed to play sound: ${effect}`, error);
  }
}

/**
 * Set global volume (0-1)
 */
export function setVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));
  
  // Update all loaded sounds
  Object.entries(soundInstances).forEach(([effect, sound]) => {
    if (sound) {
      sound.volume(SOUND_CONFIG[effect as SoundEffect].volume * globalVolume);
    }
  });
}

/**
 * Get current global volume
 */
export function getVolume(): number {
  return globalVolume;
}

/**
 * Toggle mute state
 */
export function toggleMute(): boolean {
  isMuted = !isMuted;
  return isMuted;
}

/**
 * Set mute state
 */
export function setMuted(muted: boolean): void {
  isMuted = muted;
}

/**
 * Check if sounds are muted
 */
export function isSoundMuted(): boolean {
  return isMuted;
}

/**
 * Preload all sounds
 */
export function preloadSounds(): void {
  Object.keys(SOUND_CONFIG).forEach((effect) => {
    getSound(effect as SoundEffect);
  });
}

/**
 * Sound effects shortcuts
 */
export const sounds = {
  pop: () => playSound("pop"),
  correct: () => playSound("correct"),
  wrong: () => playSound("wrong"),
  levelup: () => playSound("levelup"),
  xp: () => playSound("xp"),
  streak: () => playSound("streak"),
};
