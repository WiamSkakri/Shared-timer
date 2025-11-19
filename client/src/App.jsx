import { useMemo, useRef } from 'react';
import { useSocket, useSocketActions } from './hooks/useSocket';
import { useTimer } from './hooks/useTimer';
import { useNotification } from './hooks/useNotification';
import { createTimer } from './services/timerService';
import LandingPage from './components/LandingPage';
import TimerDisplay from './components/TimerDisplay';
import TimerJoin from './components/TimerJoin';
import TimerControls from './components/TimerControls';
import Notification from './components/Notification';
import TimerIdDisplay from './components/TimerIdDisplay';
import './App.css';

function App() {
  // Custom hooks for state management
  const {
    timerId,
    setTimerId,
    time,
    setTime,
    isRunning,
    setIsRunning,
    setIsJoined,
    startTime,
    setStartTime,
    pausedTime,
    setPausedTime,
    resetState,
  } = useTimer();
  const { message, showMessage } = useNotification(3000);
  const timerSectionRef = useRef(null);

  // Socket event callbacks
  const socketCallbacks = useMemo(() => ({
    onTimerState: (data) => {
      // Receive initial timer state when joining
      setStartTime(data.startTime);
      setPausedTime(data.pausedTime);
      setIsRunning(data.running);
      if (data.running && data.startTime) {
        // Calculate current time for already running timer
        const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
        setTime(data.pausedTime + elapsed);
      } else {
        setTime(data.pausedTime);
      }
    },
    onTimerStarted: (data) => {
      // Timer started - sync with server timestamp
      setStartTime(data.startTime);
      setPausedTime(data.pausedTime);
      setIsRunning(true);
    },
    onTimerStopped: (data) => {
      // Timer stopped - update paused time
      setPausedTime(data.pausedTime);
      setTime(data.pausedTime);
      setIsRunning(false);
      setStartTime(null);
    },
    onTimerReset: () => {
      // Timer reset - clear everything
      setTime(0);
      setPausedTime(0);
      setStartTime(null);
      setIsRunning(false);
      showMessage('Timer has been reset', 'success');
    },
    onJoinSuccess: (data) => {
      setIsJoined(true);
      showMessage(data.message, 'success');
    },
    onError: (data) => {
      showMessage(data.message, 'error');
      resetState();
    },
    onConnectError: () => {
      showMessage('Failed to connect to server', 'error');
    },
  }), [setTime, setIsRunning, setIsJoined, setStartTime, setPausedTime, showMessage, resetState]);

  // Initialize socket connection
  const socket = useSocket(socketCallbacks);
  const { joinTimer, startTimer, stopTimer, resetTimer } = useSocketActions(socket);

  // Handler for creating a new timer
  const handleCreateTimer = async () => {
    try {
      const data = await createTimer();
      setTimerId(data.timerId);
      showMessage(`Timer created! Share this ID: ${data.timerId}`, 'success');
      joinTimer(data.timerId);
    } catch (error) {
      showMessage('Failed to create timer', 'error');
    }
  };

  // Handler for joining an existing timer
  const handleJoinTimer = (id) => {
    if (!id) {
      showMessage('Please enter a timer ID', 'error');
      return;
    }
    setTimerId(id);
    joinTimer(id);
  };

  // Handler for starting the timer
  const handleStart = () => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    startTimer();
  };

  // Handler for stopping the timer
  const handleStop = () => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    stopTimer();
  };

  // Handler for resetting the timer
  const handleReset = () => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    resetTimer();
  };

  // Handler for scrolling to timer section
  const handleScrollToTimer = () => {
    timerSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <LandingPage onScrollToTimer={handleScrollToTimer} />

      <div className="timer-section" ref={timerSectionRef}>
        <div className="container">
          <TimerDisplay time={time} />

          <Notification text={message.text} type={message.type} />

          <TimerJoin
            onCreateTimer={handleCreateTimer}
            onJoinTimer={handleJoinTimer}
          />

          {timerId && (
            <>
              <TimerControls
                isRunning={isRunning}
                onStart={handleStart}
                onStop={handleStop}
                onReset={handleReset}
              />
              <TimerIdDisplay timerId={timerId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
