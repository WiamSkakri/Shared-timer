import { useState, useEffect } from 'react';

/**
 * Custom hook for managing countdown timer state with timestamp-based synchronization
 * @returns {Object} Timer state and setters
 */
export const useTimer = () => {
  const [timerId, setTimerId] = useState(null);
  const [time, setTime] = useState(0); // Current remaining time in seconds
  const [duration, setDuration] = useState(0); // Total duration in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [endTime, setEndTime] = useState(null); // Timestamp when countdown reaches 0

  // Client-side countdown timer that calculates remaining time from end timestamp
  // Updates more frequently (100ms) for smooth display
  useEffect(() => {
    let interval;
    if (isRunning && endTime !== null) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTime(remaining);
        
        // Stop timer when it reaches 0
        if (remaining === 0) {
          setIsRunning(false);
        }
      }, 100); // Update every 100ms for smooth display
    }
    return () => clearInterval(interval);
  }, [isRunning, endTime]);

  const resetState = () => {
    setTimerId(null);
    setTime(0);
    setDuration(0);
    setIsRunning(false);
    setIsJoined(false);
    setEndTime(null);
  };

  return {
    timerId,
    setTimerId,
    time,
    setTime,
    duration,
    setDuration,
    isRunning,
    setIsRunning,
    isJoined,
    setIsJoined,
    endTime,
    setEndTime,
    resetState,
  };
};
