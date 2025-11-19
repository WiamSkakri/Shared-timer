import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

/**
 * Custom hook for managing Socket.io connection and events
 * @param {Object} callbacks - Object containing callback functions for socket events
 * @param {Function} callbacks.onTimerState - Called when initial timer state is received
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
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref whenever they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    // Prevent creating a new socket if one already exists
    // This handles React StrictMode's double-mounting in development
    if (socketRef.current) {
      return;
    }

    // Initialize socket connection only once
    // Use default transports but with better reconnection settings
    socketRef.current = io({
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      autoConnect: true,
    });

    const socket = socketRef.current;

    // Debug logging
    socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    // Register event listeners with stable callback wrappers
    const timerStateHandler = (data) => callbacksRef.current.onTimerState(data);
    const timerStartedHandler = (data) => callbacksRef.current.onTimerStarted(data);
    const timerStoppedHandler = (data) => callbacksRef.current.onTimerStopped(data);
    const timerResetHandler = () => callbacksRef.current.onTimerReset();
    const joinSuccessHandler = (data) => callbacksRef.current.onJoinSuccess(data);
    const errorHandler = (data) => callbacksRef.current.onError(data);
    const connectErrorHandler = () => callbacksRef.current.onConnectError();

    socket.on('timerState', timerStateHandler);
    socket.on('timerStarted', timerStartedHandler);
    socket.on('timerStopped', timerStoppedHandler);
    socket.on('timerReset', timerResetHandler);
    socket.on('joinSuccess', joinSuccessHandler);
    socket.on('error', errorHandler);

    // Cleanup on unmount only
    return () => {
      console.log('[Socket] Cleaning up and disconnecting');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('timerState', timerStateHandler);
      socket.off('timerStarted', timerStartedHandler);
      socket.off('timerStopped', timerStoppedHandler);
      socket.off('timerReset', timerResetHandler);
      socket.off('joinSuccess', joinSuccessHandler);
      socket.off('error', errorHandler);
      socket.off('connect_error', connectErrorHandler);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty dependency array - only run once on mount

  return socketRef.current;
};

/**
 * Hook to get socket actions
 * @param {Object} socket - Socket instance from useSocket
 * @returns {Object} Socket actions
 */
export const useSocketActions = (socket) => {
  const joinTimer = (timerId) => {
    if (socket?.emit) {
      socket.emit('joinTimer', timerId);
    }
  };

  const startTimer = () => {
    if (socket?.emit) {
      socket.emit('startTimer');
    }
  };

  const stopTimer = () => {
    if (socket?.emit) {
      socket.emit('stopTimer');
    }
  };

  const resetTimer = () => {
    if (socket?.emit) {
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
