import { useEffect, useRef, useState } from 'react';
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
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();
    const socketInstance = socketRef.current;
    setSocket(socketInstance);

    // Register event listeners
    socketInstance.on('timerState', callbacks.onTimerState);
    socketInstance.on('timerStarted', callbacks.onTimerStarted);
    socketInstance.on('timerStopped', callbacks.onTimerStopped);
    socketInstance.on('timerReset', callbacks.onTimerReset);
    socketInstance.on('joinSuccess', callbacks.onJoinSuccess);
    socketInstance.on('error', callbacks.onError);
    socketInstance.on('connect_error', callbacks.onConnectError);

    // Cleanup on unmount
    return () => {
      socketInstance.off('timerState');
      socketInstance.off('timerStarted');
      socketInstance.off('timerStopped');
      socketInstance.off('timerReset');
      socketInstance.off('joinSuccess');
      socketInstance.off('error');
      socketInstance.off('connect_error');
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [callbacks]);

  return socket;
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
