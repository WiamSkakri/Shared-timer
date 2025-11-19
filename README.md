# Shared Timer

A real-time collaborative timer application built with React, Node.js, and Socket.io. Multiple users can join the same timer session and control it together with synchronized updates across all clients.

## Highlights

- Clean architecture with modular component design
- 76 comprehensive tests with Vitest and React Testing Library
- Real-time synchronization using WebSocket technology
- Modern tech stack: React 19, Vite, Socket.io
- Responsive design for mobile and desktop
- Error handling and input validation

## Key Features

- **Real-time Synchronization** - All connected users see the same timer state instantly
- **Shareable Timer Sessions** - Create a timer and share the readable ID with others
- **Collaborative Controls** - Any participant can start, pause, or reset the timer
- **Multi-user Support** - Unlimited users can join the same timer session
- **Smart State Management** - Custom React hooks for reusable logic
- **Automatic Cleanup** - Server removes inactive timers after 30 minutes
- **Low Latency Architecture** - Timestamp-based synchronization for smooth updates

## Tech Stack

### Frontend
- React 19.2 with modern hooks
- Vite 7.2 for fast builds and HMR
- Socket.io Client 4.8 for real-time communication
- Vitest 4.0 for testing
- React Testing Library for component tests
- Happy-DOM for lightweight test environment

### Backend
- Node.js
- Express.js 4.21 web framework
- Socket.io 4.8 for WebSocket communication

### Development Tools
- ESLint for code quality
- Concurrently for running multiple processes
- Vitest UI for visual test debugging

## Problem Statement

Coordinating timed activities remotely is challenging. Whether you're doing a study session with classmates, timing a workout with a friend, or cooking the same recipe together, traditional timers don't sync across devices. This app solves that by providing a shared, real-time timer that keeps everyone synchronized.

## How It Works

1. **Create a Timer** - Click "Create Timer" to generate a unique timer session
2. **Share the ID** - Copy and share the timer ID with others
3. **Join & Sync** - Others enter the ID to join the same timer
4. **Control Together** - Any participant can start or stop the timer, and all users see the changes instantly

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. Clone the repository
```bash
git clone https://github.com/WiamSkakri/Shared-timer.git
cd Shared-timer
```

2. Install dependencies for both server and client
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. Run the application

**Development mode** (runs both server and client):
```bash
npm run dev
```
This will start:
- Backend server on `http://localhost:3000`
- React dev server on `http://localhost:5173`

**Production mode**:
```bash
# Build the React app
npm run build

# Start the server
NODE_ENV=production npm run server
```

4. Open your browser and navigate to
```
http://localhost:5173 (development)
http://localhost:3000 (production)
```

## Usage

1. Open the application in your browser
2. Click **"Create Timer"** to start a new timer session
3. Copy the Timer ID from the alert popup
4. Share the Timer ID with others who want to join
5. Other users can paste the ID in the input field and click **"Join Timer"**
6. Use **Start**, **Pause**, and **Reset** buttons to control the timer
7. All connected users will see the timer update in real-time

## Testing

The application includes 76 comprehensive tests covering all layers of the application.

### Test Coverage

```
9 Test Suites - all passing
76 Tests - all passing
- Component tests: 41
- Hook tests: 18
- Service tests: 10
- Utility tests: 7
```

### Running Tests

```bash
# Run tests in watch mode
cd client
npm test

# Run tests once
npm run test:run

# Open visual test UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

#### Component Tests (41 tests)
- TimerDisplay (5 tests) - Time formatting, prop updates, CSS classes
- TimerControls (10 tests) - Button clicks, enable/disable states, callbacks
- TimerJoin (11 tests) - Input validation, Enter key support, form submission
- Notification (6 tests) - Show/hide logic, message types, prop changes
- TimerIdDisplay (9 tests) - Conditional rendering, ID handling, updates

#### Hook Tests (18 tests)
- useTimer (11 tests) - Timestamp-based state management, timer calculations, reset functionality
- useNotification (7 tests) - Message handling, auto-clear timers, manual clear
- useSocket - Integration tested via components

#### Service Tests (10 tests)
- timerService (10 tests) - HTTP requests, error handling, response parsing

#### Utility Tests (7 tests)
- timeFormatter (7 tests) - HH:MM:SS formatting, edge cases, zero-padding

### Testing Stack

- Vitest for test execution
- React Testing Library for component testing
- @testing-library/user-event for user interactions
- Happy-DOM for DOM implementation
- Vi for mocking and spies

### Testing Approach

The tests focus on user behavior rather than implementation details. All components, hooks, and utilities have comprehensive test coverage including edge cases, error conditions, and boundary values. External dependencies like Socket.io and fetch are properly mocked to ensure isolated unit tests.

## Project Architecture

This project follows clean architecture principles with clear separation of concerns:

```
Shared-timer/
├── client/                      # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── TimerDisplay.jsx         # Timer display (HH:MM:SS)
│   │   │   ├── TimerDisplay.test.jsx    # Component tests
│   │   │   ├── TimerControls.jsx        # Start/Pause/Reset buttons
│   │   │   ├── TimerControls.test.jsx   # Component tests
│   │   │   ├── TimerJoin.jsx            # Create/Join UI
│   │   │   ├── TimerJoin.test.jsx       # Component tests
│   │   │   ├── Notification.jsx         # Toast notifications
│   │   │   ├── Notification.test.jsx    # Component tests
│   │   │   ├── TimerIdDisplay.jsx       # Display timer ID
│   │   │   └── TimerIdDisplay.test.jsx  # Component tests
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useSocket.js            # Socket.io connection management
│   │   │   ├── useTimer.js             # Timer state management
│   │   │   ├── useTimer.test.js        # Hook tests
│   │   │   ├── useNotification.js      # Notification state
│   │   │   └── useNotification.test.js # Hook tests
│   │   ├── services/            # API service layer
│   │   │   ├── timerService.js         # Timer API calls
│   │   │   └── timerService.test.js    # Service tests
│   │   ├── utils/               # Utility functions
│   │   │   ├── timeFormatter.js        # Time formatting logic
│   │   │   └── timeFormatter.test.js   # Utility tests
│   │   ├── App.jsx              # Main app container
│   │   ├── App.css              # Global styles
│   │   ├── main.jsx             # React entry point
│   │   └── setupTests.js        # Test configuration
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite & Vitest config
├── server.js                    # Express & Socket.io server
├── package.json                 # Backend dependencies
├── LICENSE                      # MIT License
└── README.md                    # Documentation
```

### Architecture Highlights

- **Component-Based Design**: Each UI element is a self-contained, testable component
- **Custom Hooks**: Business logic extracted into reusable hooks (`useTimer`, `useSocket`, `useNotification`)
- **Service Layer**: API calls abstracted into dedicated service modules
- **Test Co-location**: Tests live alongside source files for easy maintenance
- **Separation of Concerns**: Clear boundaries between UI, state, and business logic

## Technical Details

### Code Quality
- Modular design with components, hooks, services, and utilities properly separated
- Custom hooks for reusable logic
- DRY principles applied throughout
- Single responsibility per module
- Readable and maintainable code

### Testing
- 76 comprehensive tests across all layers
- Tests written alongside features
- Edge cases, boundary values, and error conditions covered
- User-centric testing approach
- Ready for CI/CD pipelines

### Real-Time Architecture
- WebSocket communication for bidirectional updates
- Room-based architecture for isolated timer sessions
- Timestamp-based synchronization for low latency
- Automatic cleanup of inactive timers
- Graceful connection handling

### Performance
- Vite for fast builds and HMR
- Client-side timestamp calculations for smooth updates (100ms intervals)
- Responsive design with mobile-first CSS
- Error handling with user-friendly messages
- Input validation to prevent invalid operations

## Future Enhancements

- Database persistence (PostgreSQL or MongoDB)
- User authentication with timer history
- Countdown mode with alerts
- Dark mode and theme customization
- Pre-configured timer templates (Pomodoro, workout, etc.)
- Analytics dashboard
- Mobile app version
- Browser notifications
- Voice commands
- Export timer data as CSV

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm run test:run`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Wiam Skakri - [@WiamSkakri](https://github.com/WiamSkakri)
