"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play } from "lucide-react";
import { useSpeechSynthesis } from "@/lib/hooks/use-speech-synthesis";
import Image from "next/image";

interface StoryReaderProps {
  title: string;
  content: string;
  language?: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  onContinue: () => void;
  className?: string;
}

export function StoryReader({
  title,
  content,
  language = "en-US",
  imageUrl,
  audioUrl,
  onContinue,
  className,
}: StoryReaderProps) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis({
    lang: language,
    onError: (error) => console.error("Speech synthesis error:", error),
  });

  const handlePlayAudio = () => {
    if (audioUrl) {
      // In production, play audioUrl here
      // For now, use speech synthesis as fallback
      speak(content);
    } else {
      speak(content);
    }
  };

  const handleStop = () => {
    stop();
  };

  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {/* Story Title */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-primary">{title}</h2>
          <div className="flex items-center justify-center gap-2">
            {isSupported && (
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? handleStop : handlePlayAudio}
                className="gap-2"
              >
                {isSpeaking ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Read Story
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Story Image */}
        {imageUrl && (
          <div className="flex justify-center">
            <Image
              src={imageUrl}
              alt={title}
              width={400}
              height={300}
              className="rounded-lg object-cover max-w-full"
            />
          </div>
        )}

        {/* Story Content */}
        <div className="space-y-4 text-lg leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-4 border-t border-border">
          <Button
            onClick={() => {
              stop();
              onContinue();
            }}
            size="lg"
            className="min-w-[200px]"
          >
            Continue to Questions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

