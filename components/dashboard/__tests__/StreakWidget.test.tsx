import React from 'react';
import { render, screen } from '@testing-library/react';
import StreakWidget from '../StreakWidget';

describe('StreakWidget', () => {
  it('renders current and longest streak', () => {
    render(<StreakWidget current={5} longest={12} />);
    expect(screen.getByText(/Current Streak/i)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/12d/)).toBeInTheDocument();
  });
});
