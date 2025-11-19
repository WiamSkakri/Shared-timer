/**
 * Service for timer-related API calls
 */

/**
 * Creates a new timer on the server
 * @returns {Promise<Object>} Object containing the new timer ID
 * @throws {Error} If the request fails
 */
export const createTimer = async () => {
  try {
    const response = await fetch('/create-timer');
    if (!response.ok) {
      throw new Error('Failed to create timer');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating timer:', error);
    throw error;
  }
};

/**
 * Fetches timer statistics (if needed in the future)
 * @returns {Promise<Object>} Timer statistics
 */
export const getTimerStats = async () => {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch timer stats');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching timer stats:', error);
    throw error;
  }
};
