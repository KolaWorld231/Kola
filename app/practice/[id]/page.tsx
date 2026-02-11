"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PracticeInterface } from "@/components/lesson/practice-interface";
import { ResultsScreen } from "@/components/lesson/results-screen";
import { PageTransition } from "@/components/page-transition";
import type { ReactNode } from "react";

// Mock questions for demonstration
const MOCK_QUESTIONS = [
  {
    id: "1",
    question: "What does 'Wo de yei?' mean?",
    options: ["How are you?", "What is your name?", "Where are you from?", "What is this?"],
    correctAnswer: "How are you?",
    explanation: "This is a common Liberian greeting meaning 'How are you?' in Kru language.",
  },
  {
    id: "2",
    question: "Which word means 'thank you' in Vai?",
    options: ["Wo dei", "A-mɔ-ŋ", "Sɛ-mɔ", "Gbe-lɛ"],
    correctAnswer: "A-mɔ-ŋ",
    explanation: "In Vai language, 'A-mɔ-ŋ' is used to express gratitude.",
  },
  {
    id: "3",
    question: "What is the Liberian English word for 'greeting'?",
    options: ["Palaver", "Greet", "Howdy", "Salutation"],
    correctAnswer: "Greet",
    explanation: "Liberian English uses 'greet' as a common greeting expression.",
  },
  {
    id: "4",
    question: "In Bassa, what word means 'good'?",
    options: ["Gbo", "Dɛ", "Pa", "La"],
    correctAnswer: "Gbo",
    explanation: "The Bassa language uses 'Gbo' to mean 'good' or 'well'.",
  },
  {
    id: "5",
    question: "Which greeting is common in Mende?",
    options: ["A nyini o", "De o", "Wo de yei", "Sɛ-mɔ"],
    correctAnswer: "A nyini o",
    explanation: "'A nyini o' is a common greeting in Mende culture.",
  },
];

export default function PracticePage() {
  const params = useParams();
  const practiceId = params?.id as string;
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleComplete = (finalScore: number) => {
    setScore(finalScore);
    setCompleted(true);
  };

  return (
    <PageTransition>
      {!completed ? (
        <PracticeInterface
          questions={MOCK_QUESTIONS}
          onComplete={handleComplete}
        />
      ) : (
        <ResultsScreen
          score={score}
          totalQuestions={MOCK_QUESTIONS.length}
          xpEarned={score * 10}
          newLevel={score === MOCK_QUESTIONS.length}
          levelNumber={Math.floor(Math.random() * 20) + 1}
          onContinue={() => setCompleted(false)}
        />
      )}
    </PageTransition>
  );
}
