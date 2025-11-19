import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTimer, getTimerStats } from './timerService';

// Mock fetch globally
global.fetch = vi.fn();

describe('timerService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTimer', () => {
    it('should call /create-timer endpoint', async () => {
      const mockResponse = { timerId: 'test-timer-123' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await createTimer();

      expect(fetch).toHaveBeenCalledWith('/create-timer');
      expect(result).toEqual(mockResponse);
    });

    it('should return timer ID from response', async () => {
      const mockTimerId = 'uuid-123-456';
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timerId: mockTimerId }),
      });

      const result = await createTimer();

      expect(result.timerId).toBe(mockTimerId);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(createTimer()).rejects.toThrow('Failed to create timer');
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createTimer()).rejects.toThrow('Network error');
    });

    it('should log error to console on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch.mockRejectedValueOnce(new Error('Test error'));

      try {
        await createTimer();
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating timer:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getTimerStats', () => {
    it('should call /api/stats endpoint', async () => {
      const mockStats = { activeTimers: 5, totalUsers: 10 };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await getTimerStats();

      expect(fetch).toHaveBeenCalledWith('/api/stats');
      expect(result).toEqual(mockStats);
    });

    it('should return stats data from response', async () => {
      const mockStats = {
        activeTimers: 3,
        totalUsers: 7,
        averageTime: 120,
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const result = await getTimerStats();

      expect(result).toEqual(mockStats);
    });

    it('should throw error when response is not ok', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getTimerStats()).rejects.toThrow('Failed to fetch timer stats');
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getTimerStats()).rejects.toThrow('Network error');
    });

    it('should log error to console on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch.mockRejectedValueOnce(new Error('Test error'));

      try {
        await getTimerStats();
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching timer stats:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
