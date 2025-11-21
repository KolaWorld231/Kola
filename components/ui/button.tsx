import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-md hover:shadow-lg",
        secondary:
          "bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-dark shadow-md hover:shadow-lg",
        success:
          "bg-success text-white hover:bg-success-light active:bg-success-dark shadow-md hover:shadow-lg text-lg font-bold",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-white",
        ghost: "hover:bg-background-dark hover:text-foreground",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
      // Generate accessible label from children if aria-label not provided
      const accessibleLabel = props["aria-label"] || 
        (typeof props.children === 'string' ? props.children : 
         typeof props.children === 'number' ? String(props.children) :
         undefined);

      return (
        <button
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
          aria-label={accessibleLabel || props.title}
          tabIndex={props.tabIndex ?? 0}
        />
      );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
