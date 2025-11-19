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
  const { timerId, setTimerId, time, setTime, isRunning, setIsRunning, setIsJoined, resetState } = useTimer();
  const { message, showMessage } = useNotification(3000);
  const timerSectionRef = useRef(null);

  // Socket event callbacks
  const socketCallbacks = useMemo(() => ({
    onTimerUpdate: (timer) => {
      setTime(timer.time);
      setIsRunning(timer.running);
    },
    onTimerStarted: () => {
      setIsRunning(true);
    },
    onTimerStopped: () => {
      setIsRunning(false);
    },
    onTimerReset: (data) => {
      setTime(data.time);
      setIsRunning(data.running);
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
  }), [setTime, setIsRunning, setIsJoined, showMessage, resetState]);

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
