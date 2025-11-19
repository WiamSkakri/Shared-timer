import './Notification.css';

/**
 * Component to display notification messages
 * @param {Object} props
 * @param {string} props.text - Message text to display
 * @param {string} props.type - Message type ('success' or 'error')
 */
const Notification = ({ text, type }) => {
  if (!text) return null;

  return (
    <div className={`message ${type}`}>
      {text}
    </div>
  );
};

export default Notification;
