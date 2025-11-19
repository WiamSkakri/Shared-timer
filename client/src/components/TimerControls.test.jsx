import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimerControls from './TimerControls';

describe('TimerControls', () => {
  const mockOnStart = vi.fn();
  const mockOnStop = vi.fn();
  const mockOnReset = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all three buttons', () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should call onStart when Start button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const startButton = screen.getByText('Start');
    await user.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should call onStop when Pause button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        isRunning={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const pauseButton = screen.getByText('Pause');
    await user.click(pauseButton);

    expect(mockOnStop).toHaveBeenCalledTimes(1);
  });

  it('should call onReset when Reset button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Reset');
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('should disable Start button when timer is running', () => {
    render(
      <TimerControls
        isRunning={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const startButton = screen.getByText('Start');
    expect(startButton).toBeDisabled();
  });

  it('should disable Pause button when timer is not running', () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const pauseButton = screen.getByText('Pause');
    expect(pauseButton).toBeDisabled();
  });

  it('should enable Start button when timer is not running', () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const startButton = screen.getByText('Start');
    expect(startButton).not.toBeDisabled();
  });

  it('should enable Pause button when timer is running', () => {
    render(
      <TimerControls
        isRunning={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const pauseButton = screen.getByText('Pause');
    expect(pauseButton).not.toBeDisabled();
  });

  it('should never disable Reset button', () => {
    const { rerender } = render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    let resetButton = screen.getByText('Reset');
    expect(resetButton).not.toBeDisabled();

    rerender(
      <TimerControls
        isRunning={true}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    resetButton = screen.getByText('Reset');
    expect(resetButton).not.toBeDisabled();
  });

  it('should have correct button classes', () => {
    render(
      <TimerControls
        isRunning={false}
        onStart={mockOnStart}
        onStop={mockOnStop}
        onReset={mockOnReset}
      />
    );

    const startButton = screen.getByText('Start');
    const pauseButton = screen.getByText('Pause');
    const resetButton = screen.getByText('Reset');

    expect(startButton).toHaveClass('btn', 'btn-success');
    expect(pauseButton).toHaveClass('btn', 'btn-warning');
    expect(resetButton).toHaveClass('btn', 'btn-danger');
  });
});
