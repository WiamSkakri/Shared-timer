import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.timerId).toBeNull();
    expect(result.current.time).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isJoined).toBe(false);
    expect(result.current.startTime).toBeNull();
    expect(result.current.pausedTime).toBe(0);
  });

  it('should set timer ID', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTimerId('test-id-123');
    });

    expect(result.current.timerId).toBe('test-id-123');
  });

  it('should set time', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTime(100);
    });

    expect(result.current.time).toBe(100);
  });

  it('should set running status', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setIsRunning(true);
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('should set joined status', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setIsJoined(true);
    });

    expect(result.current.isJoined).toBe(true);
  });

  it('should calculate time when timer is running based on timestamps', () => {
    const { result } = renderHook(() => useTimer());
    const mockStartTime = Date.now();

    act(() => {
      result.current.setStartTime(mockStartTime);
      result.current.setPausedTime(0);
      result.current.setIsRunning(true);
    });

    expect(result.current.time).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.time).toBe(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.time).toBe(4);
  });

  it('should not increment time when timer is not running', () => {
    const { result } = renderHook(() => useTimer());

    expect(result.current.time).toBe(0);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.time).toBe(0);
  });

  it('should stop calculating time when timer is stopped', () => {
    const { result } = renderHook(() => useTimer());
    const mockStartTime = Date.now();

    act(() => {
      result.current.setStartTime(mockStartTime);
      result.current.setPausedTime(0);
      result.current.setIsRunning(true);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.time).toBe(3);

    act(() => {
      result.current.setIsRunning(false);
      result.current.setPausedTime(3);
      result.current.setStartTime(null);
    });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.time).toBe(3);
  });

  it('should reset all state with resetState function', () => {
    const { result } = renderHook(() => useTimer());

    act(() => {
      result.current.setTimerId('test-id');
      result.current.setTime(100);
      result.current.setIsRunning(true);
      result.current.setIsJoined(true);
      result.current.setStartTime(Date.now());
      result.current.setPausedTime(50);
    });

    expect(result.current.timerId).toBe('test-id');
    expect(result.current.time).toBe(100);
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isJoined).toBe(true);
    expect(result.current.startTime).not.toBeNull();
    expect(result.current.pausedTime).toBe(50);

    act(() => {
      result.current.resetState();
    });

    expect(result.current.timerId).toBeNull();
    expect(result.current.time).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isJoined).toBe(false);
    expect(result.current.startTime).toBeNull();
    expect(result.current.pausedTime).toBe(0);
  });

  it('should continue timer from paused time value', () => {
    const { result } = renderHook(() => useTimer());
    const mockStartTime = Date.now();

    act(() => {
      result.current.setPausedTime(50); // Previously accumulated 50 seconds
      result.current.setStartTime(mockStartTime);
      result.current.setIsRunning(true);
    });

    // Time should include paused time
    act(() => {
      vi.advanceTimersByTime(100); // Wait for first update
    });

    expect(result.current.time).toBe(50);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.time).toBe(52);
  });

  it('should set startTime and pausedTime correctly', () => {
    const { result } = renderHook(() => useTimer());
    const mockTime = Date.now();

    act(() => {
      result.current.setStartTime(mockTime);
    });

    expect(result.current.startTime).toBe(mockTime);

    act(() => {
      result.current.setPausedTime(100);
    });

    expect(result.current.pausedTime).toBe(100);
  });
});
