"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = "en-US",
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionConstructor();
      const recognition = recognitionRef.current;

      recognition.lang = lang;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript.trim());

        if (onResult) {
          onResult(fullTranscript.trim(), !!finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorMessage = event.error === "no-speech"
          ? "No speech detected. Please try again."
          : event.error === "audio-capture"
          ? "No microphone found. Please check your microphone."
          : event.error === "not-allowed"
          ? "Microphone permission denied. Please allow microphone access."
          : `Speech recognition error: ${event.error}`;

        setError(errorMessage);
        setIsListening(false);

        if (onError) {
          onError(errorMessage);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [lang, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser");
      return;
    }

    if (isListening) {
      return;
    }

    setError(null);
    setTranscript("");
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (err) {
      setError("Failed to start speech recognition");
      setIsListening(false);
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const reset = useCallback(() => {
    stopListening();
    setTranscript("");
    setError(null);
  }, [stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  };
}

