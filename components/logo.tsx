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
      {/* Volo Text with Bird Above Second 'o' */}
      {showText ? (
        <div className="relative inline-flex items-baseline">
          <span
            className={cn(
              "font-bold tracking-tight text-primary relative inline-flex items-baseline",
              textSizeClasses[size]
            )}
          >
            Vo
            <span className="relative inline-block">
              l
              <span className="relative inline-block">
                o
                {/* Bird positioned above the second 'o' */}
                <span className={cn(
                  "absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none",
                  size === "sm" && "scale-75 -top-4",
                  size === "md" && "scale-90 -top-5",
                  size === "lg" && "-top-7",
                  size === "xl" && "-top-8 scale-110"
                )}>
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn("block", sizeClasses[size])}
                    aria-hidden="true"
                  >
                    {/* Bird Body - Blue, rounded */}
                    <ellipse cx="16" cy="18" rx="8" ry="6" fill="#1B3F91" className="fill-secondary" />
                    {/* Bird Head - Blue, circular */}
                    <circle cx="10" cy="16" r="5" fill="#1B3F91" className="fill-secondary" />
                    {/* Bird Beak - Red, pointing right */}
                    <path
                      d="M14 16 L18 17 L14 18 Z"
                      fill="#D63A3A"
                      className="fill-primary"
                    />
                    {/* Bird Eye - White dot */}
                    <circle cx="11" cy="15" r="1.2" fill="#FFFFFF" />
                    {/* Bird Wing - slightly raised for flying effect */}
                    <ellipse cx="14" cy="17" rx="3" ry="4" fill="#2A56B8" className="fill-secondary-light opacity-70" transform="rotate(-20 14 17)" />
                  </svg>
                </span>
              </span>
            </span>
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
            {/* Bird Body - Blue, rounded */}
            <ellipse cx="16" cy="18" rx="8" ry="6" fill="#1B3F91" className="fill-secondary" />
            {/* Bird Head - Blue, circular */}
            <circle cx="10" cy="16" r="5" fill="#1B3F91" className="fill-secondary" />
            {/* Bird Beak - Red, pointing right */}
            <path
              d="M14 16 L18 17 L14 18 Z"
              fill="#D63A3A"
              className="fill-primary"
            />
            {/* Bird Eye - White dot */}
            <circle cx="11" cy="15" r="1.2" fill="#FFFFFF" />
            {/* Bird Wing - slightly raised for flying effect */}
            <ellipse cx="14" cy="17" rx="3" ry="4" fill="#2A56B8" className="fill-secondary-light opacity-70" transform="rotate(-20 14 17)" />
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

