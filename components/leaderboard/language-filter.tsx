"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Language {
  id: string;
  code: string;
  name: string;
  flagEmoji?: string | null;
}

interface LanguageFilterProps {
  languages: Language[];
  selectedLanguageId: string | null;
  onLanguageChange: (languageId: string | null) => void;
}

export function LanguageFilter({
  languages,
  selectedLanguageId,
  onLanguageChange,
}: LanguageFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Filter className="h-4 w-4" />
        {selectedLanguageId
          ? languages.find((l) => l.id === selectedLanguageId)?.name ||
            "All Languages"
          : "All Languages"}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-border bg-background shadow-lg z-20">
            <div className="p-2">
              <button
                onClick={() => {
                  onLanguageChange(null);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-background-dark transition-colors ${
                  selectedLanguageId === null
                    ? "bg-primary/10 text-primary font-semibold"
                    : ""
                }`}
              >
                All Languages
              </button>
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onLanguageChange(lang.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-background-dark transition-colors flex items-center gap-2 ${
                    selectedLanguageId === lang.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : ""
                  }`}
                >
                  <span>{lang.flagEmoji || "🏳️"}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}






