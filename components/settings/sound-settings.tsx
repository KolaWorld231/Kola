"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useSound } from "@/components/sound-provider";
import type { SoundEffect } from "@/types/gamification";

const SOUND_EFFECTS: SoundEffect[] = ["pop", "correct", "wrong", "levelup", "xp", "streak"];

export function SoundSettings() {
  const { volume, isMuted, setVolume, toggleMute, playSound } = useSound();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const playPreview = (effect: SoundEffect) => {
    playSound(effect);
  };

  if (!isClient) {
    return null;
  }

  return (
    <Card className="border-fresh-sage bg-gradient-to-br from-fresh-cream to-fresh-cream/80">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-fresh-blue" />
          ) : (
            <Volume2 className="h-5 w-5 text-fresh-blue" />
          )}
          <div>
            <CardTitle className="text-fresh-dark">Sound Effects</CardTitle>
            <CardDescription className="text-fresh-brown">
              Manage audio settings for your learning experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Mute Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-fresh-dark">Sound</p>
            <p className="text-sm text-fresh-brown">
              {isMuted ? "Muted" : "Enabled"}
            </p>
          </div>
          <motion.button
            onClick={toggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isMuted
                ? "bg-fresh-brown text-white"
                : "bg-fresh-green text-white"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </motion.button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-medium text-fresh-dark">Volume</p>
            <span className="text-sm text-fresh-brown font-semibold">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.1}
            disabled={isMuted}
            className="w-full"
          />
        </div>

        {/* Sound Effects Preview */}
        <div className="space-y-3 pt-4 border-t border-fresh-sage">
          <p className="font-medium text-fresh-dark">Test Sounds</p>
          <div className="grid grid-cols-2 gap-2">
            {SOUND_EFFECTS.map((effect) => (
              <motion.button
                key={effect}
                onClick={() => playPreview(effect)}
                disabled={isMuted}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 rounded-lg bg-fresh-blue/10 border border-fresh-blue/30 text-fresh-blue font-medium hover:bg-fresh-blue/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Play className="h-3 w-3" />
                <span className="text-sm capitalize">{effect}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-fresh-green/10 border border-fresh-green/30 text-sm text-fresh-brown">
          💡 Sound effects enhance your learning experience with feedback for correct answers, achievements, and milestones!
        </div>
      </CardContent>
    </Card>
  );
}
