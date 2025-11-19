import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimerDisplay from './TimerDisplay';

describe('TimerDisplay', () => {
  it('should render 00:00:00 for 0 seconds', () => {
    render(<TimerDisplay time={0} />);
    expect(screen.getByText('00:00:00')).toBeInTheDocument();
  });

  it('should render formatted time correctly', () => {
    render(<TimerDisplay time={65} />);
    expect(screen.getByText('00:01:05')).toBeInTheDocument();
  });

  it('should render large time values', () => {
    render(<TimerDisplay time={3661} />);
    expect(screen.getByText('01:01:01')).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    const { container } = render(<TimerDisplay time={30} />);
    const displayElement = container.querySelector('.timer-display');
    expect(displayElement).toBeInTheDocument();
  });

  it('should update when time prop changes', () => {
    const { rerender } = render(<TimerDisplay time={10} />);
    expect(screen.getByText('00:00:10')).toBeInTheDocument();

    rerender(<TimerDisplay time={120} />);
    expect(screen.getByText('00:02:00')).toBeInTheDocument();
  });
});
