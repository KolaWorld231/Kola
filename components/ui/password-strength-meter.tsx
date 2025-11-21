"use client";

import { calculatePasswordStrength, getPasswordStrengthColor, getPasswordStrengthTextColor } from "@/lib/password-strength";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
  className,
}: PasswordStrengthMeterProps) {
  if (!password || password.length === 0) {
    return null;
  }

  const result = calculatePasswordStrength(password);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-foreground-darkModeLight">
            Password strength:
          </span>
          <span
            className={cn(
              "font-medium capitalize",
              getPasswordStrengthTextColor(result.strength)
            )}
          >
            {result.strength}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              getPasswordStrengthColor(result.strength)
            )}
            style={{ width: `${result.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            {result.requirements.minLength ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                result.requirements.minLength
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-foreground-darkModeLight"
              )}
            >
              At least 8 characters
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result.requirements.hasUppercase ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                result.requirements.hasUppercase
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-foreground-darkModeLight"
              )}
            >
              One uppercase letter
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result.requirements.hasLowercase ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                result.requirements.hasLowercase
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-foreground-darkModeLight"
              )}
            >
              One lowercase letter
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result.requirements.hasNumber ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                result.requirements.hasNumber
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-foreground-darkModeLight"
              )}
            >
              One number
            </span>
          </div>
          <div className="flex items-center gap-2">
            {result.requirements.hasSpecialChar ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={cn(
                result.requirements.hasSpecialChar
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-foreground-darkModeLight"
              )}
            >
              One special character
            </span>
          </div>
        </div>
      )}
    </div>
  );
}



