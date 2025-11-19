import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notification messages
 * @param {number} duration - Duration in milliseconds before message disappears (default: 3000)
 * @returns {Object} Message state and show function
 */
export const useNotification = (duration = 3000) => {
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, duration);
  }, [duration]);

  const clearMessage = useCallback(() => {
    setMessage({ text: '', type: '' });
  }, []);

  return {
    message,
    showMessage,
    clearMessage,
  };
};
