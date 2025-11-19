import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimerJoin from './TimerJoin';

describe('TimerJoin', () => {
  const mockOnCreateTimer = vi.fn();
  const mockOnJoinTimer = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render Create Timer button', () => {
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    expect(screen.getByText('Create Timer')).toBeInTheDocument();
  });

  it('should render Join Timer button and input', () => {
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    expect(screen.getByPlaceholderText('Enter Timer ID')).toBeInTheDocument();
    expect(screen.getByText('Join Timer')).toBeInTheDocument();
  });

  it('should call onCreateTimer when Create Timer button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const createButton = screen.getByText('Create Timer');
    await user.click(createButton);

    expect(mockOnCreateTimer).toHaveBeenCalledTimes(1);
  });

  it('should call onJoinTimer with timer ID when Join Timer button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');
    const joinButton = screen.getByText('Join Timer');

    await user.type(input, 'test-timer-123');
    await user.click(joinButton);

    expect(mockOnJoinTimer).toHaveBeenCalledWith('test-timer-123');
  });

  it('should not call onJoinTimer when input is empty', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const joinButton = screen.getByText('Join Timer');
    await user.click(joinButton);

    expect(mockOnJoinTimer).not.toHaveBeenCalled();
  });

  it('should trim whitespace from timer ID before calling onJoinTimer', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');
    const joinButton = screen.getByText('Join Timer');

    await user.type(input, '  test-id  ');
    await user.click(joinButton);

    expect(mockOnJoinTimer).toHaveBeenCalledWith('test-id');
  });

  it('should clear input after joining timer', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');
    const joinButton = screen.getByText('Join Timer');

    await user.type(input, 'test-id');
    expect(input).toHaveValue('test-id');

    await user.click(joinButton);
    expect(input).toHaveValue('');
  });

  it('should call onJoinTimer when Enter key is pressed in input', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');

    await user.type(input, 'test-id{Enter}');

    expect(mockOnJoinTimer).toHaveBeenCalledWith('test-id');
  });

  it('should not call onJoinTimer when Enter is pressed with empty input', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');

    await user.type(input, '{Enter}');

    expect(mockOnJoinTimer).not.toHaveBeenCalled();
  });

  it('should update input value as user types', async () => {
    const user = userEvent.setup();
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const input = screen.getByPlaceholderText('Enter Timer ID');

    await user.type(input, 'abc');
    expect(input).toHaveValue('abc');

    await user.type(input, '123');
    expect(input).toHaveValue('abc123');
  });

  it('should have correct button classes', () => {
    render(
      <TimerJoin
        onCreateTimer={mockOnCreateTimer}
        onJoinTimer={mockOnJoinTimer}
      />
    );

    const createButton = screen.getByText('Create Timer');
    const joinButton = screen.getByText('Join Timer');

    expect(createButton).toHaveClass('btn', 'btn-primary');
    expect(joinButton).toHaveClass('btn', 'btn-secondary');
  });
});
