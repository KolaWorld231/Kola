import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AchievementsGallery from '../AchievementsGallery';

describe('AchievementsGallery', () => {
  beforeAll(() => {
    // @ts-ignore
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ achievements: [
        { code: 'first-lesson', name: 'First Lesson', description: 'Complete your first lesson', unlocked: true }
      ] }) })
    );
  });

  afterAll(() => {
    // @ts-ignore
    global.fetch = undefined;
  });

  it('renders fetched achievements', async () => {
    render(<AchievementsGallery userId={"demo-id"} />);
    // match exact title and description to avoid ambiguous substring matches
    await screen.findByText('First Lesson');
    await screen.findByText('Complete your first lesson');
  });
});
