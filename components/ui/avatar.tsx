import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = "md",
      fallback,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = React.useState(false);
    const displayName = name || alt || "User";
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const showImage = src && !imgError;

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-secondary text-white",
          sizeClasses[size],
          className
        )}
        role="img"
        aria-label={alt || displayName}
        {...props}
      >
        {showImage ? (
          <Image
            src={src}
            alt={alt || displayName}
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-semibold">
            {fallback || initials || "?"}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };







