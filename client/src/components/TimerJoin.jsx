import { useState } from 'react';
import './TimerJoin.css';

/**
 * Component for creating or joining a timer
 * @param {Object} props
 * @param {Function} props.onCreateTimer - Callback when creating a new timer
 * @param {Function} props.onJoinTimer - Callback when joining an existing timer
 */
const TimerJoin = ({ onCreateTimer, onJoinTimer }) => {
  const [inputTimerId, setInputTimerId] = useState('');

  const handleJoinClick = () => {
    if (inputTimerId.trim()) {
      onJoinTimer(inputTimerId.trim());
      setInputTimerId('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinClick();
    }
  };

  return (
    <div className="controls">
      <button onClick={onCreateTimer} className="btn btn-primary">
        Create Timer
      </button>

      <div className="join-section">
        <input
          type="text"
          value={inputTimerId}
          onChange={(e) => setInputTimerId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Timer ID"
          className="input"
        />
        <button onClick={handleJoinClick} className="btn btn-secondary">
          Join Timer
        </button>
      </div>
    </div>
  );
};

export default TimerJoin;
