import { useState } from 'react';
import './DurationInput.css';

function DurationInput({ onSetDuration, disabled }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5); // Default to 5 minutes
  const [seconds, setSeconds] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetDuration(hours, minutes, seconds);
  };

  const handleQuickSet = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    setHours(h);
    setMinutes(m);
    setSeconds(0);
    onSetDuration(h, m, 0);
  };

  return (
    <div className="duration-input">
      <h3>Set Countdown Timer</h3>
      
      {/* Quick set buttons */}
      <div className="quick-set-buttons">
        <button 
          type="button" 
          onClick={() => handleQuickSet(1)} 
          disabled={disabled}
          className="quick-btn"
        >
          1 min
        </button>
        <button 
          type="button" 
          onClick={() => handleQuickSet(5)} 
          disabled={disabled}
          className="quick-btn"
        >
          5 min
        </button>
        <button 
          type="button" 
          onClick={() => handleQuickSet(10)} 
          disabled={disabled}
          className="quick-btn"
        >
          10 min
        </button>
        <button 
          type="button" 
          onClick={() => handleQuickSet(25)} 
          disabled={disabled}
          className="quick-btn"
        >
          25 min
        </button>
        <button 
          type="button" 
          onClick={() => handleQuickSet(60)} 
          disabled={disabled}
          className="quick-btn"
        >
          1 hour
        </button>
      </div>

      {/* Custom duration input */}
      <form onSubmit={handleSubmit} className="duration-form">
        <div className="time-inputs">
          <div className="time-input-group">
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={disabled}
            />
            <label>Hours</label>
          </div>
          <span className="colon">:</span>
          <div className="time-input-group">
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={disabled}
            />
            <label>Minutes</label>
          </div>
          <span className="colon">:</span>
          <div className="time-input-group">
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={disabled}
            />
            <label>Seconds</label>
          </div>
        </div>
        <button type="submit" className="set-duration-btn" disabled={disabled}>
          Set Timer
        </button>
      </form>
    </div>
  );
}

export default DurationInput;

