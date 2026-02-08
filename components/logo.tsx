import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const textSizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-5xl",
};

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Kola Text with packaged logo image */}
      {showText ? (
        <div className="inline-flex items-center gap-3">
          <img
            src="/brand-assets/kola-logo.png"
            alt="Kola"
            className={cn("block", sizeClasses[size])}
          />
          <span
            className={cn("font-bold tracking-tight text-kola-deep", textSizeClasses[size])}
          >
            Kola
          </span>
        </div>
      ) : (
        /* Standalone Bird Icon */
        <div className={cn("relative flex-shrink-0", sizeClasses[size])}>
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Bird Body - Kola Primary Teal */}
            <ellipse cx="16" cy="18" rx="8" ry="6" fill="#58A8A8" />
            {/* Bird Head - Kola Primary Teal */}
            <circle cx="10" cy="16" r="5" fill="#58A8A8" />
            {/* Bird Beak - Warm Bronze */}
            <path d="M14 16 L18 17 L14 18 Z" fill="#884828" />
            {/* Bird Eye - White dot */}
            <circle cx="11" cy="15" r="1.2" fill="#FFFFFF" />
            {/* Bird Wing - Kola Accent Green (subtle) */}
            <ellipse
              cx="14"
              cy="17"
              rx="3"
              ry="4"
              fill="#48A898"
              opacity="0.85"
              transform="rotate(-20 14 17)"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Standalone bird icon for use in headers/favicons
export function BirdIcon({ className, size = "md" }: Omit<LogoProps, "showText">) {
  return <Logo className={className} size={size} showText={false} />;
}
