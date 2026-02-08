"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Logo } from "@/components/logo";
import { ArrowRight, ArrowLeft, CheckCircle2, Globe, Target, Users, BookOpen, Heart, MessageCircle, PenTool, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiValidators } from "@/lib/api-response-validator";

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  flagEmoji?: string | null;
  description?: string | null;
}

const LIBERIAN_TRIBES = [
  "Kpelle",
  "Bassa",
  "Gio",
  "Mano",
  "Grebo",
  "Kru",
  "Vai",
  "Gola",
  "Kissi",
  "Loma",
  "Other",
  "Prefer not to say",
];

const LEARNING_GOALS = [
  { id: "conversation", label: "Conversation", icon: MessageCircle, description: "Speak with family and friends" },
  { id: "reading", label: "Reading", icon: BookOpen, description: "Read texts and literature" },
  { id: "writing", label: "Writing", icon: PenTool, description: "Write in the language" },
  { id: "culture", label: "Cultural Connection", icon: Heart, description: "Connect with my heritage" },
  { id: "business", label: "Business", icon: Target, description: "Use for work or business" },
  { id: "travel", label: "Travel", icon: Globe, description: "Travel to Liberia" },
];

const LEVELS = [
  { value: "beginner", label: "Beginner", description: "I'm just starting out" },
  { value: "intermediate", label: "Intermediate", description: "I know some basics" },
  { value: "advanced", label: "Advanced", description: "I'm already fluent" },
];

const DAILY_GOALS = [
  { value: 20, label: "Casual (20 XP/day)", description: "A few minutes a day" },
  { value: 50, label: "Regular (50 XP/day)", description: "About 15 minutes a day" },
  { value: 100, label: "Serious (100 XP/day)", description: "30+ minutes a day" },
  { value: 200, label: "Intensive (200 XP/day)", description: "1+ hours a day" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  
  // Assessment data
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedTribe, setSelectedTribe] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDailyGoal, setSelectedDailyGoal] = useState<number>(50);

  const totalSteps = 5;

  // Handle authentication redirect
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Check if user is admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          setIsAdmin(data.isAdmin || false);
        })
        .catch(() => {
          setIsAdmin(false);
        });
    }
  }, [status, session]);

  // Fetch languages when authenticated - simplified approach
  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(true);
      return;
    }

    // Only fetch if we don't have languages yet
    if (languages.length > 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Fetch and validate languages
    console.log("[ONBOARDING] Fetching languages...");
    fetch("/api/languages")
      .then(async (r) => {
        try {
          console.log("[ONBOARDING] Languages response status:", r.status, r.ok);
          // apiValidators.languages handles Response.ok check and parsing
          const data = await apiValidators.languages(r);
          console.log("[ONBOARDING] Languages data received:", data);
          if (data?.languages && Array.isArray(data.languages)) {
            console.log("[ONBOARDING] Setting languages:", data.languages.length, "languages");
            setLanguages(data.languages);
            setIsLoading(false);
          } else {
            console.warn("[ONBOARDING] No languages found in response:", data);
            setLanguages([]);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("[ONBOARDING] Error fetching/validating languages:", error);
          setLanguages([]);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("[ONBOARDING] Network error fetching languages:", error);
        setLanguages([]);
        setIsLoading(false);
      });
  }, [status, languages.length]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSkip = async () => {
    if (isAdmin) {
      alert("Admin users must complete onboarding. Please continue with the setup.");
      return;
    }

    if (!confirm("Are you sure you want to skip onboarding? You can always update your preferences later in settings.")) {
      return;
    }

    setIsSkipping(true);
    try {
      const response = await fetch("/api/user/assessment/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("Onboarding skipped successfully:", data);
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Error skipping onboarding:", data);
        alert(data.error || "Failed to skip onboarding. Please try again.");
      }
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSkipping(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!selectedLanguageId) {
      alert("Please select a language to continue.");
      setStep(1); // Go back to language selection
      return;
    }

    if (!selectedLevel) {
      alert("Please select your current level.");
      setStep(2); // Go back to level selection
      return;
    }

    // Validate that selected language still exists in the list
    const languageExists = languages.some(lang => lang.id === selectedLanguageId);
    if (!languageExists) {
      alert("The selected language is no longer available. Please select a different language.");
      setSelectedLanguageId("");
      setStep(1); // Go back to language selection
      return;
    }

    // Debug logging
    console.log("Submitting assessment with:", {
      languageId: selectedLanguageId,
      level: selectedLevel,
      tribe: selectedTribe,
      learningGoals: selectedGoals,
      dailyGoal: selectedDailyGoal,
      availableLanguages: languages.map(l => ({ id: l.id, code: l.code, name: l.name }))
    });

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languageId: selectedLanguageId,
          level: selectedLevel,
          tribe: selectedTribe || null,
          learningGoals: selectedGoals,
          dailyGoal: selectedDailyGoal,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log("Assessment submitted successfully:", data);
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Error submitting assessment:", {
          status: response.status,
          data: data,
          submittedLanguageId: selectedLanguageId
        });
        const errorMessage = data.error || "Failed to save assessment. Please try again.";
        
        // If it's a language error, go back to language selection
        if (errorMessage.includes("language") || data.code === 'P2003') {
          const debugInfo = data.debug ? `\n\nDebug info: ${JSON.stringify(data.debug, null, 2)}` : '';
          alert(errorMessage + " Please select a valid language." + debugInfo);
          setSelectedLanguageId("");
          setStep(1);
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!selectedLanguageId;
      case 2:
        return !!selectedLevel;
      case 3:
        return true; // Tribe is optional
      case 4:
        return selectedGoals.length > 0;
      case 5:
        return !!selectedDailyGoal;
      default:
        return false;
    }
  };

  // Show loading only during initial authentication check or when fetching languages
  if (status === "loading" || (isLoading && languages.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background-darkMode">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-liberian-red/5 via-white to-liberian-blue/5 dark:from-liberian-red/10 dark:via-background-darkMode dark:to-liberian-blue/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-liberian-red mb-2">
            Welcome to Kola! 🇱🇷
          </h1>
          <p className="text-gray-600 dark:text-foreground-darkModeLight">
            Let's personalize your learning experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 dark:text-foreground-darkModeLight mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <ProgressBar value={(step / totalSteps) * 100} variant="default" className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 1 && (
                <>
                  <Globe className="inline h-6 w-6 mr-2 text-liberian-blue" />
                  Which language would you like to learn?
                </>
              )}
              {step === 2 && (
                <>
                  <Target className="inline h-6 w-6 mr-2 text-liberian-blue" />
                  What's your current level?
                </>
              )}
              {step === 3 && (
                <>
                  <Users className="inline h-6 w-6 mr-2 text-liberian-blue" />
                  What's your tribe? (Optional)
                </>
              )}
              {step === 4 && (
                <>
                  <Sparkles className="inline h-6 w-6 mr-2 text-liberian-blue" />
                  What are your learning goals?
                </>
              )}
              {step === 5 && (
                <>
                  <BookOpen className="inline h-6 w-6 mr-2 text-liberian-blue" />
                  Set your daily learning goal
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Language Selection */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-foreground-darkModeLight mb-4">
                  Choose the Liberian language you'd like to start learning.
                </p>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                    <span className="ml-3 text-gray-600 dark:text-foreground-darkModeLight">
                      Loading languages...
                    </span>
                  </div>
                ) : languages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-foreground-darkModeLight mb-2">
                      No languages available at the moment.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-foreground-darkModeLight/70">
                      Please check back later or contact support.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setSelectedLanguageId(lang.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          selectedLanguageId === lang.id
                            ? "border-liberian-blue bg-liberian-blue/10 dark:bg-liberian-blue/20"
                            : "border-gray-200 dark:border-border-darkMode hover:border-liberian-blue/50 dark:hover:border-liberian-blue/50 bg-white dark:bg-background-darkModeSecondary"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flagEmoji || "🇱🇷"}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">
                              {lang.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
                              {lang.nativeName}
                            </div>
                          </div>
                          {selectedLanguageId === lang.id && (
                            <CheckCircle2 className="h-5 w-5 text-liberian-blue" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Level Selection */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-foreground-darkModeLight mb-4">
                  Help us understand your starting point so we can personalize your lessons.
                </p>
                <div className="space-y-3">
                  {LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedLevel(level.value)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                        selectedLevel === level.value
                          ? "border-liberian-blue bg-liberian-blue/10 dark:bg-liberian-blue/20"
                          : "border-gray-200 dark:border-border-darkMode hover:border-liberian-blue/50 dark:hover:border-liberian-blue/50 bg-white dark:bg-background-darkModeSecondary"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">
                            {level.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
                            {level.description}
                          </div>
                        </div>
                        {selectedLevel === level.value && (
                          <CheckCircle2 className="h-5 w-5 text-liberian-blue" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Tribe Selection (Optional) */}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-foreground-darkModeLight mb-4">
                  This helps us connect you with relevant cultural content and community.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LIBERIAN_TRIBES.map((tribe) => (
                    <button
                      key={tribe}
                      onClick={() => setSelectedTribe(tribe)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-center transition-all",
                        selectedTribe === tribe
                          ? "border-liberian-blue bg-liberian-blue/10 dark:bg-liberian-blue/20"
                          : "border-gray-200 dark:border-border-darkMode hover:border-liberian-blue/50 dark:hover:border-liberian-blue/50 bg-white dark:bg-background-darkModeSecondary"
                      )}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-foreground-darkMode">
                        {tribe}
                      </span>
                      {selectedTribe === tribe && (
                        <CheckCircle2 className="h-4 w-4 text-liberian-blue mx-auto mt-1" />
                      )}
                    </button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTribe("")}
                  className="w-full mt-2"
                >
                  Skip this step
                </Button>
              </div>
            )}

            {/* Step 4: Learning Goals */}
            {step === 4 && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-foreground-darkModeLight mb-4">
                  Select all that apply. This helps us recommend the right content for you.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LEARNING_GOALS.map((goal) => {
                    const Icon = goal.icon;
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 text-left transition-all",
                          isSelected
                            ? "border-liberian-blue bg-liberian-blue/10 dark:bg-liberian-blue/20"
                            : "border-gray-200 dark:border-border-darkMode hover:border-liberian-blue/50 dark:hover:border-liberian-blue/50 bg-white dark:bg-background-darkModeSecondary"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={cn(
                            "h-5 w-5 mt-0.5",
                            isSelected ? "text-liberian-blue" : "text-gray-400 dark:text-foreground-darkModeMuted"
                          )} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">
                              {goal.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
                              {goal.description}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-liberian-blue shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 5: Daily Goal */}
            {step === 5 && (
              <div className="space-y-3">
                <p className="text-gray-600 dark:text-foreground-darkModeLight mb-4">
                  How much time do you want to dedicate to learning each day?
                </p>
                <div className="space-y-3">
                  {DAILY_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setSelectedDailyGoal(goal.value)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                        selectedDailyGoal === goal.value
                          ? "border-liberian-blue bg-liberian-blue/10 dark:bg-liberian-blue/20"
                          : "border-gray-200 dark:border-border-darkMode hover:border-liberian-blue/50 dark:hover:border-liberian-blue/50 bg-white dark:bg-background-darkModeSecondary"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-foreground-darkMode">
                            {goal.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-foreground-darkModeLight">
                            {goal.description}
                          </div>
                        </div>
                        {selectedDailyGoal === goal.value && (
                          <CheckCircle2 className="h-5 w-5 text-liberian-blue" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {/* Skip button - only show for non-admin users */}
            {isAdmin === false && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={isSkipping}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                {isSkipping ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Skipping...
                  </>
                ) : (
                  "Skip for now"
                )}
              </Button>
            )}
          </div>
          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Saving...
                </>
              ) : (
                <>
                  Complete Setup
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

