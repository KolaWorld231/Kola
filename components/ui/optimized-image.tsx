"use client";

/**
 * Optimized Image Component
 * Wrapper around Next.js Image with optimized defaults
 */

import Image from "next/image";
import { ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ComponentProps<typeof Image>, "src" | "alt"> {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback = "/images/placeholder.png",
  priority = false,
  className,
  width,
  height,
  sizes,
  fill,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  // Default sizes for responsive images
  const defaultSizes =
    sizes ||
    "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw";

  const handleError = () => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If fill prop is used
  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={imgSrc}
          alt={alt}
          fill
          sizes={defaultSizes}
          priority={priority}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          {...props}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" aria-hidden="true" />
        )}
      </div>
    );
  }

  // With width and height
  return (
    <div className={cn("relative inline-block", className)}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 800}
        height={height || 600}
        sizes={defaultSizes}
        priority={priority}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        {...props}
      />
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          aria-hidden="true"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

