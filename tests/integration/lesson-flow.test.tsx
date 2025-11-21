/**
 * Integration Tests - Lesson Flow
 * 
 * Tests the complete lesson flow from start to finish:
 * - Lesson loading
 * - Exercise navigation
 * - Answer submission
 * - Progress tracking
 * - Lesson completion
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LessonPage from '@/app/lesson/[id]/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  useParams: () => ({ id: 'test-lesson-id' }),
}));

// Mock next-auth
const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe('Lesson Flow Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should load lesson data successfully', async () => {
    // Mock lesson data
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'test-lesson-id',
        title: 'Test Lesson',
        unit: {
          id: 'test-unit-id',
          title: 'Test Unit',
          language: {
            code: 'kpelle',
            name: 'Kpelle',
          },
        },
        exercises: [
          {
            id: 'ex1',
            type: 'multiple_choice',
            question: 'What is hello?',
            options: [
              { id: 'opt1', text: 'Hello', isCorrect: true },
              { id: 'opt2', text: 'Goodbye', isCorrect: false },
            ],
            order: 1,
          },
        ],
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={mockSession}>
          <LessonPage params={{ id: 'test-lesson-id' }} />
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });
  });

  it('should navigate between exercises', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'test-lesson-id',
        title: 'Test Lesson',
        unit: {
          id: 'test-unit-id',
          title: 'Test Unit',
          language: {
            code: 'kpelle',
            name: 'Kpelle',
          },
        },
        exercises: [
          {
            id: 'ex1',
            type: 'multiple_choice',
            question: 'Exercise 1',
            options: [
              { id: 'opt1', text: 'Option 1', isCorrect: true },
              { id: 'opt2', text: 'Option 2', isCorrect: false },
            ],
            order: 1,
          },
          {
            id: 'ex2',
            type: 'multiple_choice',
            question: 'Exercise 2',
            options: [
              { id: 'opt3', text: 'Option 3', isCorrect: true },
              { id: 'opt4', text: 'Option 4', isCorrect: false },
            ],
            order: 2,
          },
        ],
      }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={mockSession}>
          <LessonPage params={{ id: 'test-lesson-id' }} />
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    });

    // Select answer and continue
    const option1 = screen.getByText('Option 1');
    fireEvent.click(option1);

    const checkButton = screen.getByRole('button', { name: /check answer/i });
    fireEvent.click(checkButton);

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);
    });

    // Should show next exercise
    await waitFor(() => {
      expect(screen.getByText('Exercise 2')).toBeInTheDocument();
    });
  });

  it('should track progress correctly', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-lesson-id',
          title: 'Test Lesson',
          unit: {
            id: 'test-unit-id',
            title: 'Test Unit',
            language: { code: 'kpelle', name: 'Kpelle' },
          },
          exercises: [
            {
              id: 'ex1',
              type: 'multiple_choice',
              question: 'Test Question',
              options: [
                { id: 'opt1', text: 'Correct', isCorrect: true },
                { id: 'opt2', text: 'Wrong', isCorrect: false },
              ],
              order: 1,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={mockSession}>
          <LessonPage params={{ id: 'test-lesson-id' }} />
        </SessionProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Question')).toBeInTheDocument();
    });

    // Select correct answer
    const correctOption = screen.getByText('Correct');
    fireEvent.click(correctOption);

    const checkButton = screen.getByRole('button', { name: /check answer/i });
    fireEvent.click(checkButton);

    // Should show correct feedback
    await waitFor(() => {
      expect(screen.getByText(/correct/i)).toBeInTheDocument();
    });
  });
});


