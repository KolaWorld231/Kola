import { create } from "zustand";
import type { LearningState, ExerciseAnswer, Lesson, Language } from "@/lib/types";

interface LearningStore extends LearningState {
  setCurrentLanguage: (language: Language | null) => void;
  setCurrentLesson: (lesson: Lesson | null) => void;
  setCurrentExerciseIndex: (index: number) => void;
  addAnswer: (answer: ExerciseAnswer) => void;
  updateScore: (correct: number, total: number) => void;
  resetLearningState: () => void;
  completeLesson: () => void;
}

const initialState: LearningState = {
  currentLanguage: null,
  currentLesson: null,
  currentExerciseIndex: 0,
  answers: [],
  score: {
    correct: 0,
    total: 0,
  },
  isCompleted: false,
};

export const useLearningStore = create<LearningStore>((set) => ({
  ...initialState,

  setCurrentLanguage: (language) =>
    set({
      currentLanguage: language,
    }),

  setCurrentLesson: (lesson) =>
    set({
      currentLesson: lesson,
      currentExerciseIndex: 0,
      answers: [],
      score: { correct: 0, total: 0 },
      isCompleted: false,
    }),

  setCurrentExerciseIndex: (index) =>
    set({
      currentExerciseIndex: index,
    }),

  addAnswer: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),

  updateScore: (correct, total) =>
    set({
      score: {
        correct,
        total,
      },
    }),

  resetLearningState: () =>
    set({
      ...initialState,
    }),

  completeLesson: () =>
    set({
      isCompleted: true,
    }),
}));

