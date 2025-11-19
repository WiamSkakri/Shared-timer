import './TimerIdDisplay.css';

/**
 * Component to display the current timer ID
 * @param {Object} props
 * @param {string} props.timerId - The timer ID to display
 */
const TimerIdDisplay = ({ timerId }) => {
  if (!timerId) return null;

  return (
    <div className="timer-id-display">
      <p>Timer ID: <code>{timerId}</code></p>
    </div>
  );
};

export default TimerIdDisplay;
