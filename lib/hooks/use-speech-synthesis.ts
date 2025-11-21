"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const {
    lang = "en-US",
    rate = 1,
    pitch = 1,
    volume = 1,
    onEnd,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);

    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        if (onError) {
          onError("Speech synthesis is not supported in this browser");
        }
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (onEnd) {
          onEnd();
        }
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        utteranceRef.current = null;
        if (onError) {
          onError(`Speech synthesis error: ${event.error}`);
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, rate, pitch, volume, onEnd, onError]
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.resume();
    }
  }, [isSupported, isSpeaking]);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
    pause,
    resume,
  };
}

