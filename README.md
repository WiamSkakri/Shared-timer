# Shared Timer

A real-time collaborative timer application that allows multiple users to share and synchronize a timer across different devices. Perfect for study sessions, workouts, cooking with friends, or any activity where you need to stay in sync with others.

## Features

- **Real-time Synchronization** - All connected users see the same timer state instantly
- **Shareable Timer Sessions** - Create a timer and share the unique ID with others to join
- **Simple Controls** - Start, stop, and monitor the timer with an intuitive interface
- **Multi-user Support** - Unlimited users can join the same timer session
- **Minimal Design** - Clean, distraction-free interface focused on the timer

## Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.io (WebSockets)
- **Styling**: Modern CSS with responsive design
- **ID Generation**: UUID v4

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
6. Use **Start** and **Stop** buttons to control the timer
7. All connected users will see the timer update in real-time

## Project Structure

```
Shared-timer/
├── client/             # React frontend
│   ├── src/
│   │   ├── App.jsx     # Main React component
│   │   ├── App.css     # Component styling
│   │   └── main.jsx    # React entry point
│   ├── package.json    # Frontend dependencies
│   └── vite.config.js  # Vite configuration
├── server.js           # Express & Socket.io server
├── package.json        # Backend dependencies
└── README.md          # Documentation
```

## Future Enhancements

- Timer reset functionality
- Timer persistence (save timer state to database)
- User authentication and timer history
- Custom timer durations and countdown mode
- Timer notifications/alerts
- Mobile app version

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

MIT

## Author

Wiam Skakri - [GitHub Profile](https://github.com/WiamSkakri)

---

**Note**: This project was built as a portfolio piece to demonstrate full-stack development skills with real-time web technologies.
