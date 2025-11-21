"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarTipProps {
  title?: string;
  content: string;
  example?: string;
  exampleTranslation?: string;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function GrammarTip({
  title = "Grammar Tip",
  content,
  example,
  exampleTranslation,
  expanded: controlledExpanded,
  onToggle,
  className,
}: GrammarTipProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const isControlled = controlledExpanded !== undefined;

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  return (
    <Card className={cn("bg-yellow-50 border-yellow-200", className)}>
      <CardHeader
        className="cursor-pointer hover:bg-yellow-100/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-lg text-yellow-900">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className="h-auto p-1"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-yellow-700" />
            ) : (
              <ChevronDown className="h-5 w-5 text-yellow-700" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <p className="text-sm text-yellow-900 leading-relaxed">{content}</p>
          {example && (
            <div className="p-3 rounded-lg bg-background border border-yellow-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                <BookOpen className="h-3 w-3" />
                Example
              </div>
              <p className="text-base font-medium text-foreground">{example}</p>
              {exampleTranslation && (
                <p className="text-sm text-foreground-light italic">
                  {exampleTranslation}
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}





