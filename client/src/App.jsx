import { useMemo, useRef, useEffect } from 'react';
import { useSocket, useSocketActions } from './hooks/useSocket';
import { useTimer } from './hooks/useTimer';
import { useNotification } from './hooks/useNotification';
import { createTimer } from './services/timerService';
import LandingPage from './components/LandingPage';
import TimerDisplay from './components/TimerDisplay';
import TimerJoin from './components/TimerJoin';
import TimerControls from './components/TimerControls';
import DurationInput from './components/DurationInput';
import Notification from './components/Notification';
import TimerIdDisplay from './components/TimerIdDisplay';
import './App.css';

function App() {
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  // Custom hooks for state management
  const {
    timerId,
    setTimerId,
    time,
    setTime,
    duration,
    setDuration,
    isRunning,
    setIsRunning,
    setIsJoined,
    endTime,
    setEndTime,
    resetState,
  } = useTimer();
  const { message, showMessage } = useNotification(3000);
  const timerSectionRef = useRef(null);

  // Socket event callbacks
  const socketCallbacks = useMemo(() => ({
    onTimerState: (data) => {
      // Receive initial timer state when joining
      setDuration(data.duration);
      setEndTime(data.endTime);
      setIsRunning(data.running);
      if (data.running && data.endTime) {
        // Calculate current remaining time for already running timer
        const remaining = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
        setTime(remaining);
      } else {
        setTime(data.remainingTime);
      }
    },
    onDurationSet: (data) => {
      // Duration was set
      setDuration(data.duration);
      setTime(data.remainingTime);
      showMessage(`Timer set to ${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')}`, 'success');
    },
    onTimerStarted: (data) => {
      // Timer started - sync with server end timestamp
      setEndTime(data.endTime);
      setIsRunning(true);
      showMessage('Timer started!', 'success');
    },
    onTimerStopped: (data) => {
      // Timer stopped - update remaining time
      setTime(data.remainingTime);
      setIsRunning(false);
      setEndTime(null);
      showMessage('Timer paused', 'success');
    },
    onTimerReset: (data) => {
      // Timer reset - back to duration
      setTime(data.remainingTime);
      setDuration(data.duration);
      setEndTime(null);
      setIsRunning(false);
      showMessage('Timer has been reset', 'success');
    },
    onTimerCompleted: () => {
      // Timer reached 0!
      setTime(0);
      setIsRunning(false);
      setEndTime(null);
      showMessage('⏰ Time is up!', 'success');
      // Play sound/notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: 'Your countdown timer has finished.',
          icon: '/vite.svg'
        });
      }
    },
    onJoinSuccess: (data) => {
      setIsJoined(true);
      showMessage(data.message, 'success');
    },
    onError: (data) => {
      showMessage(data.message, 'error');
    },
    onConnectError: () => {
      showMessage('Failed to connect to server', 'error');
    },
  }), [setTime, setDuration, setIsRunning, setIsJoined, setEndTime, showMessage, resetState]);

  // Initialize socket connection
  const socket = useSocket(socketCallbacks);
  const { joinTimer, setDuration: setTimerDuration, startTimer, stopTimer, resetTimer } = useSocketActions(socket);

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

  // Handler for setting countdown duration
  const handleSetDuration = (hours, minutes, seconds) => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds <= 0) {
      showMessage('Please set a valid duration', 'error');
      return;
    }
    setTimerDuration(totalSeconds);
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
              <DurationInput 
                onSetDuration={handleSetDuration}
                disabled={isRunning}
              />
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
