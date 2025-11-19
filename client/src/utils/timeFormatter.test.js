import { describe, it, expect } from 'vitest';
import { formatTime } from './timeFormatter';

describe('formatTime', () => {
  it('should format 0 seconds correctly', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });

  it('should format seconds less than 60', () => {
    expect(formatTime(30)).toBe('00:00:30');
    expect(formatTime(5)).toBe('00:00:05');
    expect(formatTime(59)).toBe('00:00:59');
  });

  it('should format exactly 60 seconds (1 minute)', () => {
    expect(formatTime(60)).toBe('00:01:00');
  });

  it('should format minutes and seconds correctly', () => {
    expect(formatTime(90)).toBe('00:01:30');
    expect(formatTime(125)).toBe('00:02:05');
    expect(formatTime(599)).toBe('00:09:59');
  });

  it('should handle large time values', () => {
    expect(formatTime(3600)).toBe('01:00:00'); // 1 hour
    expect(formatTime(3661)).toBe('01:01:01'); // 1 hour, 1 minute, 1 second
    expect(formatTime(5999)).toBe('01:39:59');
  });

  it('should pad single digits with zeros', () => {
    expect(formatTime(65)).toBe('00:01:05');
    expect(formatTime(9)).toBe('00:00:09');
    expect(formatTime(600)).toBe('00:10:00');
  });

  it('should handle hours, minutes, and seconds', () => {
    expect(formatTime(7325)).toBe('02:02:05'); // 2 hours, 2 minutes, 5 seconds
    expect(formatTime(86399)).toBe('23:59:59'); // Just under 24 hours
  });
});
