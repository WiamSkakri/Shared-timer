import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io();

function App() {
  const [timerId, setTimerId] = useState(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputTimerId, setInputTimerId] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    // Socket event listeners
    socket.on('timerUpdate', (timer) => {
      setTime(timer.time);
      setIsRunning(timer.running);
    });

    socket.on('timerStarted', () => {
      setIsRunning(true);
    });

    socket.on('timerStopped', () => {
      setIsRunning(false);
    });

    socket.on('joinSuccess', (data) => {
      setIsJoined(true);
      showMessage(data.message, 'success');
    });

    socket.on('error', (data) => {
      showMessage(data.message, 'error');
      setIsJoined(false);
      setTimerId(null);
    });

    socket.on('connect_error', () => {
      showMessage('Failed to connect to server', 'error');
    });

    return () => {
      socket.off('timerUpdate');
      socket.off('timerStarted');
      socket.off('timerStopped');
      socket.off('joinSuccess');
      socket.off('error');
      socket.off('connect_error');
    };
  }, []);

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

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleCreateTimer = async () => {
    try {
      const response = await fetch('/create-timer');
      const data = await response.json();
      setTimerId(data.timerId);
      showMessage(`Timer created! Share this ID: ${data.timerId}`, 'success');
      socket.emit('joinTimer', data.timerId);
    } catch (error) {
      showMessage('Failed to create timer', 'error');
    }
  };

  const handleJoinTimer = () => {
    const id = inputTimerId.trim();
    if (!id) {
      showMessage('Please enter a timer ID', 'error');
      return;
    }
    setTimerId(id);
    socket.emit('joinTimer', id);
  };

  const handleStart = () => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    socket.emit('startTimer');
  };

  const handleStop = () => {
    if (!timerId) {
      showMessage('Please create or join a timer first', 'error');
      return;
    }
    socket.emit('stopTimer');
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">
          Shared Timer
          <div className="gradient-line"></div>
        </h1>

        <div className="timer-display">{formatTime(time)}</div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="controls">
          <button onClick={handleCreateTimer} className="btn btn-primary">
            Create Timer
          </button>

          <div className="join-section">
            <input
              type="text"
              value={inputTimerId}
              onChange={(e) => setInputTimerId(e.target.value)}
              placeholder="Enter Timer ID"
              className="input"
            />
            <button onClick={handleJoinTimer} className="btn btn-secondary">
              Join Timer
            </button>
          </div>
        </div>

        {isJoined && (
          <div className="actions">
            <button
              onClick={handleStart}
              className="btn btn-success"
              disabled={isRunning}
            >
              Start
            </button>
            <button
              onClick={handleStop}
              className="btn btn-danger"
              disabled={!isRunning}
            >
              Stop
            </button>
          </div>
        )}

        {timerId && (
          <div className="timer-id-display">
            <p>Timer ID: <code>{timerId}</code></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
