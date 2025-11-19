import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TimerIdDisplay from './TimerIdDisplay';

describe('TimerIdDisplay', () => {
  it('should not render when timerId is null', () => {
    const { container } = render(<TimerIdDisplay timerId={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when timerId is undefined', () => {
    const { container } = render(<TimerIdDisplay timerId={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when timerId is empty string', () => {
    const { container } = render(<TimerIdDisplay timerId="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render timer ID when provided', () => {
    render(<TimerIdDisplay timerId="test-id-123" />);

    expect(screen.getByText(/Timer ID:/i)).toBeInTheDocument();
    expect(screen.getByText('test-id-123')).toBeInTheDocument();
  });

  it('should render timer ID in a code element', () => {
    render(<TimerIdDisplay timerId="test-id-456" />);

    const codeElement = screen.getByText('test-id-456');
    expect(codeElement.tagName).toBe('CODE');
  });

  it('should have correct CSS class', () => {
    const { container } = render(<TimerIdDisplay timerId="test-id" />);

    const displayElement = container.querySelector('.timer-id-display');
    expect(displayElement).toBeInTheDocument();
  });

  it('should update when timerId prop changes', () => {
    const { rerender } = render(<TimerIdDisplay timerId="first-id" />);
    expect(screen.getByText('first-id')).toBeInTheDocument();

    rerender(<TimerIdDisplay timerId="second-id" />);
    expect(screen.queryByText('first-id')).not.toBeInTheDocument();
    expect(screen.getByText('second-id')).toBeInTheDocument();
  });

  it('should handle UUID format timer IDs', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    render(<TimerIdDisplay timerId={uuid} />);

    expect(screen.getByText(uuid)).toBeInTheDocument();
  });

  it('should hide when timerId becomes null', () => {
    const { rerender, container } = render(<TimerIdDisplay timerId="test-id" />);
    expect(screen.getByText('test-id')).toBeInTheDocument();

    rerender(<TimerIdDisplay timerId={null} />);
    expect(container.firstChild).toBeNull();
  });
});
