import { useState, useEffect } from 'react';

/**
 * Custom hook for managing timer state
 * @returns {Object} Timer state and setters
 */
export const useTimer = () => {
  const [timerId, setTimerId] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  // Client-side timer for smooth updates
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const resetState = () => {
    setTimerId(null);
    setTime(0);
    setIsRunning(false);
    setIsJoined(false);
  };

  return {
    timerId,
    setTimerId,
    time,
    setTime,
    isRunning,
    setIsRunning,
    isJoined,
    setIsJoined,
    resetState,
  };
};
