import './LandingPage.css';

const LandingPage = ({ onScrollToTimer }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1 className="landing-title">
          Welcome to
        </h1>
        <h2 className="landing-brand">
          <span className="shared-text">Shared</span>{' '}
          <span className="timer-text">Timer</span>
        </h2>
        <div className="gradient-line-landing"></div>
        <p className="landing-tagline">
          create timer | join timer | control it together
        </p>

        <button
          className="scroll-arrow"
          onClick={onScrollToTimer}
          aria-label="Scroll to timer"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
