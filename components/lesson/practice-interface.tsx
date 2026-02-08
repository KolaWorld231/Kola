"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnswerFeedback } from "@/components/feedback/AnswerFeedback";
import { MascotReactions } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfetti } from "@/components/animations";
import { useSound } from "@/components/sound-provider";
import type { FeedbackType } from "@/types/gamification";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface PracticeInterfaceProps {
  questions: Question[];
  onComplete?: (score: number) => void;
}

export function PracticeInterface({ questions, onComplete }: PracticeInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackType | null>(null);
  const [answered, setAnswered] = useState(false);
  const { fire } = useConfetti();
  const { playSound } = useSound();

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (selected: string) => {
    if (answered) return;

    setAnswered(true);
    const isCorrect = selected === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      setFeedback("correct");
      playSound("correct");
      fire({ particleCount: 100, spread: 70 });
    } else {
      setFeedback("wrong");
      playSound("wrong");
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete?.(score + (answered && feedback === "correct" ? 1 : 0));
    } else {
      setCurrentIndex(currentIndex + 1);
      setAnswered(false);
      setFeedback(null);
    }
  };

  return (
    <div className="min-h-screen bg-fresh-cream py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-fresh-dark">Practice</h1>
            <span className="text-sm font-semibold text-fresh-brown">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <motion.div
            className="w-full bg-fresh-sage rounded-full h-2 overflow-hidden"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
          >
            <motion.div
              className="h-full bg-fresh-green"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        </div>

        {/* Mascot */}
        <div className="flex justify-center mb-8">
          <MascotReactions
            mood={answered ? (feedback === "correct" ? "celebrating" : "encouraging") : "thinking"}
            message={
              answered
                ? feedback === "correct"
                  ? "Great job! 🎉"
                  : "Try again!"
                : "What's your answer?"
            }
            size="md"
          />
        </div>

        {/* Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentIndex}
        >
          <Card className="border-fresh-blue/40 bg-white shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-fresh-dark">{currentQuestion.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected =
                    answered && option === currentQuestion.correctAnswer;
                  const isWrong =
                    answered &&
                    option !== currentQuestion.correctAnswer;

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={answered}
                      whileHover={!answered ? { scale: 1.02 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      className={`p-4 rounded-lg border-2 text-left font-medium transition-all ${
                        isSelected
                          ? "border-fresh-green bg-fresh-green/10 text-fresh-green"
                          : isWrong
                          ? "border-destructive bg-destructive/10 text-destructive"
                          : answered
                          ? "border-fresh-sage bg-fresh-sage/5 text-fresh-brown"
                          : "border-fresh-blue/40 bg-fresh-blue/5 text-fresh-dark hover:border-fresh-blue/60"
                      }`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              {answered && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-fresh-blue/10 border border-fresh-blue/30 text-sm text-fresh-blue"
                >
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <div className="mb-8">
              <AnswerFeedback
                type={feedback}
                isVisible={true}
                onComplete={() => {}}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Next Button */}
        {answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleNext}
              size="lg"
              className="bg-fresh-blue hover:bg-fresh-blue text-white font-semibold"
            >
              {isLastQuestion ? "See Results" : "Next Question"}
            </Button>
          </motion.div>
        )}

        {/* Score Display */}
        <motion.div
          className="mt-8 text-center text-fresh-brown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm font-medium">
            Correct: {score} / {currentIndex}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
