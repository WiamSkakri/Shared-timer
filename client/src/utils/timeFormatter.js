/**
 * Formats seconds into HH:MM:SS format
 * @param {number} seconds - The number of seconds to format
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTime = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hours}:${mins}:${secs}`;
};
