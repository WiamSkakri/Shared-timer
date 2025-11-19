import './TimerControls.css';

/**
 * Component for timer control buttons (Start, Pause, Reset)
 * @param {Object} props
 * @param {boolean} props.isRunning - Whether the timer is currently running
 * @param {Function} props.onStart - Callback for start button
 * @param {Function} props.onStop - Callback for pause button
 * @param {Function} props.onReset - Callback for reset button
 */
const TimerControls = ({ isRunning, onStart, onStop, onReset }) => {
  return (
    <div className="actions">
      <button
        onClick={onStart}
        className="btn btn-success"
        disabled={isRunning}
      >
        Start
      </button>
      <button
        onClick={onStop}
        className="btn btn-warning"
        disabled={!isRunning}
      >
        Pause
      </button>
      <button
        onClick={onReset}
        className="btn btn-danger"
      >
        Reset
      </button>
    </div>
  );
};

export default TimerControls;
