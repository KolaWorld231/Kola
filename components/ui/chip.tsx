import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-white",
        primary: "bg-primary text-white",
        success: "bg-success text-white",
        accent: "bg-accent text-foreground",
        outline: "border-2 border-border bg-transparent text-foreground",
        muted: "bg-background-dark text-foreground-light",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  onRemove?: () => void;
  removable?: boolean;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, size, children, onRemove, removable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        {...props}
      >
        <span>{children}</span>
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);
Chip.displayName = "Chip";

export { Chip, chipVariants };







