"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarTipProps {
  tip: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function GrammarTip({ tip, className, defaultExpanded = false }: GrammarTipProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!tip || !tip.trim()) {
    return null;
  }

  return (
    <Card className={cn("border-accent/30 bg-accent/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <BookOpen className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-accent">Grammar Tip</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
                aria-label={isExpanded ? "Collapse tip" : "Expand tip"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isExpanded && (
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {tip}
              </div>
            )}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-sm text-accent hover:underline cursor-pointer"
              >
                Click to read grammar tip
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

