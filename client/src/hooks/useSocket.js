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
    // In production, connect to the same origin (empty string means same host)
    // In development, Vite proxy will redirect to localhost:3000
    const serverUrl = window.location.origin;

    console.log('[Socket] Initializing connection to:', serverUrl);

    socketRef.current = io(serverUrl, {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,  // Keep trying to reconnect
      timeout: 20000,
      autoConnect: true,
      path: '/socket.io',
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      upgrade: true,
      rememberUpgrade: true,
      forceNew: false,  // Reuse existing connection
    });

    const socket = socketRef.current;

    // Debug logging
    socket.on('connect', () => {
      console.log('[Socket] Connected - ID:', socket.id);
      console.log('[Socket] Transport:', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server forcefully disconnected, need to reconnect manually
        console.log('[Socket] Server disconnected us, reconnecting...');
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt #', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed completely');
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      console.error('[Socket] Error details:', error);
    });

    socket.io.engine.on('upgrade', (transport) => {
      console.log('[Socket] Transport upgraded to:', transport.name);
    });

    // Register event listeners with stable callback wrappers
    const timerStateHandler = (data) => {
      console.log('[Socket] Received timerState:', data);
      callbacksRef.current.onTimerState(data);
    };
    const durationSetHandler = (data) => {
      console.log('[Socket] Received durationSet:', data);
      callbacksRef.current.onDurationSet(data);
    };
    const timerStartedHandler = (data) => {
      console.log('[Socket] Received timerStarted:', data);
      callbacksRef.current.onTimerStarted(data);
    };
    const timerStoppedHandler = (data) => {
      console.log('[Socket] Received timerStopped:', data);
      callbacksRef.current.onTimerStopped(data);
    };
    const timerResetHandler = (data) => {
      console.log('[Socket] Received timerReset:', data);
      callbacksRef.current.onTimerReset(data);
    };
    const timerCompletedHandler = () => {
      console.log('[Socket] Received timerCompleted');
      callbacksRef.current.onTimerCompleted();
    };
    const joinSuccessHandler = (data) => {
      console.log('[Socket] Received joinSuccess:', data);
      callbacksRef.current.onJoinSuccess(data);
    };
    const errorHandler = (data) => {
      console.log('[Socket] Received error:', data);
      callbacksRef.current.onError(data);
    };
    const connectErrorHandler = () => {
      console.log('[Socket] Connect error handler called');
      callbacksRef.current.onConnectError();
    };

    socket.on('timerState', timerStateHandler);
    socket.on('durationSet', durationSetHandler);
    socket.on('timerStarted', timerStartedHandler);
    socket.on('timerStopped', timerStoppedHandler);
    socket.on('timerReset', timerResetHandler);
    socket.on('timerCompleted', timerCompletedHandler);
    socket.on('joinSuccess', joinSuccessHandler);
    socket.on('error', errorHandler);

    // Cleanup on unmount only
    return () => {
      console.log('[Socket] Cleaning up and disconnecting');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('timerState', timerStateHandler);
      socket.off('durationSet', durationSetHandler);
      socket.off('timerStarted', timerStartedHandler);
      socket.off('timerStopped', timerStoppedHandler);
      socket.off('timerReset', timerResetHandler);
      socket.off('timerCompleted', timerCompletedHandler);
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
  const currentTimerIdRef = useRef(null);

  const emitWhenConnected = (eventName, data) => {
    if (!socket) {
      console.error('[Socket] Socket not initialized');
      return;
    }

    if (socket.connected) {
      console.log(`[Socket] Emitting ${eventName}`, data);
      socket.emit(eventName, data);
    } else {
      console.log(`[Socket] Waiting for connection to emit ${eventName}`);
      // Wait for connection then emit
      socket.once('connect', () => {
        console.log(`[Socket] Connected, now emitting ${eventName}`, data);
        socket.emit(eventName, data);
      });
    }
  };

  // Set up auto-rejoin on reconnection
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      console.log('[Socket] Handling reconnection...');
      if (currentTimerIdRef.current) {
        console.log('[Socket] Auto-rejoining timer:', currentTimerIdRef.current);
        socket.emit('joinTimer', currentTimerIdRef.current);
      }
    };

    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('reconnect', handleReconnect);
    };
  }, [socket]);

  const joinTimer = (timerId) => {
    currentTimerIdRef.current = timerId;
    emitWhenConnected('joinTimer', timerId);
  };

  const setDuration = (durationInSeconds) => {
    emitWhenConnected('setDuration', durationInSeconds);
  };

  const startTimer = () => {
    emitWhenConnected('startTimer');
  };

  const stopTimer = () => {
    emitWhenConnected('stopTimer');
  };

  const resetTimer = () => {
    emitWhenConnected('resetTimer');
  };

  return {
    joinTimer,
    setDuration,
    startTimer,
    stopTimer,
    resetTimer,
  };
};
