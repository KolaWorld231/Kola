import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lesson, Exercise, CompleteLessonRequest, CompleteLessonResponse } from "@/lib/types";

const API_BASE = "/api";

// Fetch single lesson with exercises
export function useLesson(lessonId: string) {
  return useQuery<Lesson & { exercises: Exercise[] }>({
    queryKey: ["lessons", lessonId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/lessons/${lessonId}`);
      if (!res.ok) throw new Error("Failed to fetch lesson");
      return res.json();
    },
    enabled: !!lessonId,
  });
}

// Complete lesson mutation
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation<CompleteLessonResponse, Error, CompleteLessonRequest>({
    mutationFn: async (data) => {
      const res = await fetch(`${API_BASE}/lessons/${data.lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctAnswers: data.correctAnswers,
          totalQuestions: data.totalQuestions,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete lesson");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["user", "progress"] });
      queryClient.invalidateQueries({ queryKey: ["user", "xp"] });
      queryClient.invalidateQueries({ queryKey: ["user", "achievements"] });
    },
  });
}






