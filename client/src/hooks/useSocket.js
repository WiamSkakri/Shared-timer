import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing Socket.io connection and events
 * @param {Object} callbacks - Object containing callback functions for socket events
 * @param {Function} callbacks.onTimerUpdate - Called when timer state updates
 * @param {Function} callbacks.onTimerStarted - Called when timer starts
 * @param {Function} callbacks.onTimerStopped - Called when timer stops
 * @param {Function} callbacks.onTimerReset - Called when timer resets
 * @param {Function} callbacks.onJoinSuccess - Called when successfully joined a timer
 * @param {Function} callbacks.onError - Called when an error occurs
 * @param {Function} callbacks.onConnectError - Called when connection fails
 * @returns {Object} Socket instance
 */
export const useSocket = (callbacks) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    const socket = socketRef.current;

    // Register event listeners
    socket.on('timerUpdate', callbacks.onTimerUpdate);
    socket.on('timerStarted', callbacks.onTimerStarted);
    socket.on('timerStopped', callbacks.onTimerStopped);
    socket.on('timerReset', callbacks.onTimerReset);
    socket.on('joinSuccess', callbacks.onJoinSuccess);
    socket.on('error', callbacks.onError);
    socket.on('connect_error', callbacks.onConnectError);

    // Cleanup on unmount
    return () => {
      socket.off('timerUpdate');
      socket.off('timerStarted');
      socket.off('timerStopped');
      socket.off('timerReset');
      socket.off('joinSuccess');
      socket.off('error');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [callbacks]);

  return socketRef.current;
};

/**
 * Hook to get socket actions
 * @param {Object} socket - Socket instance from useSocket
 * @returns {Object} Socket actions
 */
export const useSocketActions = (socket) => {
  const joinTimer = (timerId) => {
    if (socket) {
      socket.emit('joinTimer', timerId);
    }
  };

  const startTimer = () => {
    if (socket) {
      socket.emit('startTimer');
    }
  };

  const stopTimer = () => {
    if (socket) {
      socket.emit('stopTimer');
    }
  };

  const resetTimer = () => {
    if (socket) {
      socket.emit('resetTimer');
    }
  };

  return {
    joinTimer,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
