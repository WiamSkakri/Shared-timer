import { useState, useEffect } from 'react';

/**
 * Custom hook for managing timer state with timestamp-based synchronization
 * @returns {Object} Timer state and setters
 */
export const useTimer = () => {
  const [timerId, setTimerId] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(0);

  // Client-side timer that calculates time from timestamps
  // Updates more frequently (100ms) for smooth display
  useEffect(() => {
    let interval;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime(pausedTime + elapsed);
      }, 100); // Update every 100ms for smooth display
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, pausedTime]);

  const resetState = () => {
    setTimerId(null);
    setTime(0);
    setIsRunning(false);
    setIsJoined(false);
    setStartTime(null);
    setPausedTime(0);
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
    startTime,
    setStartTime,
    pausedTime,
    setPausedTime,
    resetState,
  };
};
