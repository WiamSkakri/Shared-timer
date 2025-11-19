import { formatTime } from '../utils/timeFormatter';
import './TimerDisplay.css';

/**
 * Component to display the timer in MM:SS format
 * @param {Object} props
 * @param {number} props.time - Current time in seconds
 */
const TimerDisplay = ({ time }) => {
  return (
    <div className="timer-display">
      {formatTime(time)}
    </div>
  );
};

export default TimerDisplay;
