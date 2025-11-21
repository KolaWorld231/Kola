"use client";

import { cn } from "@/lib/utils";

interface PathCharacterProps {
  isVisible: boolean;
  position?: "left" | "right" | "center";
  className?: string;
  character?: "default" | "happy" | "excited";
}

/**
 * Character/Mascot placement on learning path (Duolingo-inspired)
 * Shows current position with an animated character
 */
export function PathCharacter({
  isVisible,
  position = "left",
  className,
  character = "default",
}: PathCharacterProps) {
  if (!isVisible) return null;

  const positionClasses = {
    left: "left-[-20px]",
    right: "right-[-20px]",
    center: "left-1/2 -translate-x-1/2",
  };

  const characterEmojis = {
    default: "🎓",
    happy: "😊",
    excited: "🎉",
  };

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-500",
        positionClasses[position],
        className
      )}
    >
      {/* Character container with base/platform */}
      <div className="relative">
        {/* Base/platform (circular) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-gray-700 rounded-full opacity-80 blur-sm" />
        
        {/* Character */}
        <div
          className={cn(
            "relative w-20 h-20 rounded-full bg-gradient-to-br from-liberian-blue to-liberian-red flex items-center justify-center shadow-xl border-4 border-white",
            "animate-bounce hover:scale-110 transition-transform cursor-pointer gpu-accelerated",
            "text-4xl"
          )}
          style={{
            animation: "bounce 2s infinite",
          }}
        >
          <span className="relative z-10">{characterEmojis[character]}</span>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-liberian-red/30 blur-xl animate-pulse" />
        </div>

        {/* Floating particles (optional) */}
        <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: "0.5s" }} />
        <div className="absolute -bottom-2 left-0 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
}

