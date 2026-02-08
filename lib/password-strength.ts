/**
 * Password strength calculation and validation utilities
 */

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number; // 0-100
  feedback: string[];
  meetsRequirements: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  let score = 0;
  const feedback: string[] = [];

  // Length scoring (0-30 points)
  if (password.length >= 12) {
    score += 30;
  } else if (password.length >= 8) {
    score += 20;
  } else if (password.length >= 6) {
    score += 10;
  } else {
    feedback.push("Use at least 8 characters");
  }

  // Character variety scoring (0-40 points)
  let varietyScore = 0;
  if (requirements.hasUppercase) varietyScore += 10;
  if (requirements.hasLowercase) varietyScore += 10;
  if (requirements.hasNumber) varietyScore += 10;
  if (requirements.hasSpecialChar) varietyScore += 10;
  score += varietyScore;

  // Complexity bonus (0-30 points)
  if (password.length >= 12 && varietyScore >= 30) {
    score += 30;
  } else if (password.length >= 10 && varietyScore >= 20) {
    score += 20;
  } else if (varietyScore >= 20) {
    score += 10;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine strength level
  let strength: PasswordStrength;
  if (score >= 80) {
    strength = "strong";
  } else if (score >= 60) {
    strength = "good";
  } else if (score >= 40) {
    strength = "fair";
  } else {
    strength = "weak";
  }

  // Generate feedback
  if (!requirements.minLength) {
    feedback.push("At least 8 characters");
  }
  if (!requirements.hasUppercase) {
    feedback.push("One uppercase letter");
  }
  if (!requirements.hasLowercase) {
    feedback.push("One lowercase letter");
  }
  if (!requirements.hasNumber) {
    feedback.push("One number");
  }
  if (!requirements.hasSpecialChar) {
    feedback.push("One special character");
  }

  const meetsRequirements =
    requirements.minLength &&
    requirements.hasUppercase &&
    requirements.hasLowercase &&
    requirements.hasNumber &&
    requirements.hasSpecialChar;

  return {
    strength,
    score,
    feedback: feedback.length > 0 ? feedback : ["Password meets all requirements"],
    meetsRequirements,
    requirements,
  };
}

/**
 * Get color for password strength
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "bg-red-500";
    case "fair":
      return "bg-orange-500";
    case "good":
      return "bg-yellow-500";
    case "strong":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
}

/**
 * Get text color for password strength
 */
export function getPasswordStrengthTextColor(strength: PasswordStrength): string {
  switch (strength) {
    case "weak":
      return "text-red-600 dark:text-red-400";
    case "fair":
      return "text-orange-600 dark:text-orange-400";
    case "good":
      return "text-yellow-600 dark:text-yellow-400";
    case "strong":
      return "text-green-600 dark:text-green-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
}





