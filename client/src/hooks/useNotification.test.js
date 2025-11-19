import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotification } from './useNotification';

describe('useNotification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty message', () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current.message).toEqual({ text: '', type: '' });
  });

  it('should show success message', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showMessage('Test success', 'success');
    });

    expect(result.current.message).toEqual({
      text: 'Test success',
      type: 'success',
    });
  });

  it('should show error message', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showMessage('Test error', 'error');
    });

    expect(result.current.message).toEqual({
      text: 'Test error',
      type: 'error',
    });
  });

  it('should auto-clear message after default duration (3000ms)', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showMessage('Test message', 'success');
    });

    expect(result.current.message.text).toBe('Test message');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.message).toEqual({ text: '', type: '' });
  });

  it('should auto-clear message after custom duration', () => {
    const { result } = renderHook(() => useNotification(5000));

    act(() => {
      result.current.showMessage('Test message', 'success');
    });

    expect(result.current.message.text).toBe('Test message');

    // Should not clear after 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.message.text).toBe('Test message');

    // Should clear after 5000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.message).toEqual({ text: '', type: '' });
  });

  it('should manually clear message', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showMessage('Test message', 'success');
    });

    expect(result.current.message.text).toBe('Test message');

    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message).toEqual({ text: '', type: '' });
  });

  it('should replace previous message with new one', () => {
    const { result } = renderHook(() => useNotification());

    act(() => {
      result.current.showMessage('First message', 'success');
    });

    expect(result.current.message.text).toBe('First message');

    act(() => {
      result.current.showMessage('Second message', 'error');
    });

    expect(result.current.message).toEqual({
      text: 'Second message',
      type: 'error',
    });
  });
});
