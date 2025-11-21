"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";
import { Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ListenChooseExerciseProps {
  question: string;
  audioUrl?: string;
  audioText?: string; // Text to speak if no audio URL
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  language?: string;
  onSelect: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function ListenChooseExercise({
  question,
  audioUrl,
  audioText,
  options,
  language = "en-US",
  onSelect,
  disabled = false,
}: ListenChooseExerciseProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis({
    lang: language,
    onEnd: () => {
      setIsPlaying(false);
    },
    onError: (error) => {
      console.error("Speech synthesis error:", error);
      setIsPlaying(false);
    },
  });

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        console.error("Error playing audio file, falling back to text-to-speech");
        if (audioText) {
          speak(audioText);
          setIsPlaying(true);
        }
      };
      setAudioElement(audio);
      return () => {
        audio.pause();
        audio.src = "";
      };
    }
  }, [audioUrl, audioText, speak]);

  const handlePlay = () => {
    if (isPlaying) {
      // Stop current playback
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      if (isSpeaking) {
        stop();
      }
      setIsPlaying(false);
    } else {
      if (audioUrl && audioElement) {
        // Play audio file if available
        audioElement.play().catch((error) => {
          console.error("Error playing audio:", error);
          // Fall back to text-to-speech
          if (audioText) {
            speak(audioText);
            setIsPlaying(true);
          }
        });
        setIsPlaying(true);
      } else if (audioText) {
        // Use text-to-speech
        speak(audioText);
        setIsPlaying(true);
      }
    }
  };

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    if (disabled || hasAnswered) return;

    setSelectedOptionId(optionId);
    setHasAnswered(true);
    onSelect(isCorrect);
  };

  // Sync playing state with speaking state
  useEffect(() => {
    setIsPlaying(isSpeaking);
  }, [isSpeaking]);

  if (!isSupported && !audioUrl) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
        <p className="font-semibold mb-2">Audio Not Supported</p>
        <p className="text-sm">
          Your browser doesn&apos;t support text-to-speech. Please use a modern
          browser or ensure audio files are uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-lg font-semibold text-foreground dark:text-foreground-darkMode">{question}</div>

      {/* Audio Player */}
      <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-background-dark dark:bg-background-darkModeSecondary border border-border dark:border-border-darkMode">
        <Button
          onClick={handlePlay}
          disabled={disabled || (!audioText && !audioUrl)}
          variant={isPlaying ? "destructive" : "default"}
          size="lg"
          className="h-14 w-14 rounded-full"
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Volume2 className="h-6 w-6" />
          )}
        </Button>
        <div className="text-sm text-foreground-light dark:text-foreground-darkModeLight">
          {isPlaying
            ? "Playing audio..."
            : audioUrl || audioText
            ? "Click to listen"
            : "No audio available"}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const showCorrect = hasAnswered && option.isCorrect;
          const showIncorrect = hasAnswered && isSelected && !option.isCorrect;

          return (
            <Button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect)}
              disabled={disabled || hasAnswered}
              variant={
                showCorrect
                  ? "default"
                  : showIncorrect
                  ? "destructive"
                  : isSelected
                  ? "outline"
                  : "outline"
              }
              className={cn(
                "w-full justify-start text-left h-auto py-4 px-4",
                showCorrect && "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 border-green-600 dark:border-green-700",
                showIncorrect && "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 border-red-600 dark:border-red-700"
              )}
            >
              {option.text}
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {hasAnswered && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            selectedOptionId &&
              options.find((o) => o.id === selectedOptionId)?.isCorrect
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
          )}
        >
          <p className="font-semibold">
            {selectedOptionId &&
            options.find((o) => o.id === selectedOptionId)?.isCorrect
              ? "Correct! Well done!"
              : "Not quite. Try listening again!"}
          </p>
        </div>
      )}
    </div>
  );
}

