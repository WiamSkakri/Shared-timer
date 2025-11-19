const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true  // Allow same origin in production
      : 'http://localhost:5173',  // Vite dev server in development
    credentials: true,
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],  // Support both transports
  pingTimeout: 60000,  // How long to wait for pong before disconnect (60 seconds)
  pingInterval: 25000,  // Send ping every 25 seconds to keep connection alive
  upgradeTimeout: 30000,  // Time to wait for upgrade to complete
  maxHttpBufferSize: 1e6,  // 1 MB buffer size
  allowUpgrades: true,  // Allow transport upgrades
});

let timers = {};

// Word lists for generating funny, memorable timer IDs
const adjectives = [
  'happy', 'silly', 'crazy', 'lazy', 'fuzzy', 'dizzy', 'bouncy', 'sleepy',
  'grumpy', 'snazzy', 'wacky', 'quirky', 'jolly', 'cheeky', 'funky', 'goofy',
  'loopy', 'zippy', 'perky', 'sassy', 'clumsy', 'sparkly', 'wobbly', 'giggly',
  'sneaky', 'dreamy', 'fluffy', 'bumpy', 'jumpy', 'lumpy', 'spicy', 'crispy',
  'rainy', 'sunny', 'cloudy', 'breezy', 'foggy', 'snowy', 'windy', 'stormy',
  'mighty', 'tiny', 'giant', 'swift', 'brave', 'bold', 'wild', 'calm'
];

const nouns = [
  'cloud', 'kitchen', 'pancake', 'waffle', 'muffin', 'cookie', 'pickle', 'noodle',
  'potato', 'banana', 'taco', 'burrito', 'pizza', 'donut', 'cupcake', 'sandwich',
  'penguin', 'koala', 'llama', 'panda', 'hamster', 'bunny', 'turtle', 'dolphin',
  'octopus', 'narwhal', 'unicorn', 'dragon', 'phoenix', 'wizard', 'ninja', 'pirate',
  'rocket', 'comet', 'planet', 'galaxy', 'meteor', 'rainbow', 'thunder', 'lightning',
  'mountain', 'river', 'ocean', 'forest', 'desert', 'valley', 'volcano', 'island',
  'robot', 'spaceship', 'castle', 'treasure', 'crystal', 'diamond', 'star', 'moon'
];

/**
 * Generates a random readable timer ID
 * Format: adjective-noun-number (e.g., happy-cloud-42)
 * @returns {string} A unique, memorable timer ID
 */
function generateReadableId() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000); // 0-999

  let id = `${adjective}-${noun}-${number}`;

  // Ensure uniqueness - if ID exists, try again
  while (timers[id]) {
    const newNumber = Math.floor(Math.random() * 1000);
    id = `${adjective}-${noun}-${newNumber}`;
  }

  return id;
}

// Timer cleanup configuration
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Endpoint to create a new timer
app.get('/create-timer', (req, res) => {
  const timerId = generateReadableId(); // Generate unique, readable timer ID
  timers[timerId] = {
    duration: 0,          // Total countdown duration in seconds (set by user)
    remainingTime: 0,     // Remaining time in seconds
    endTime: null,        // Timestamp when countdown reaches 0 (null if not running)
    running: false,
    lastActivity: Date.now(),
    connectedUsers: 0,
  };
  res.json({ timerId });
});

// Optional: Server stats endpoint for monitoring
app.get('/api/stats', (req, res) => {
  const now = Date.now();
  const stats = {
    totalTimers: Object.keys(timers).length,
    activeTimers: Object.values(timers).filter(t => t.running).length,
    totalConnectedUsers: Object.values(timers).reduce((sum, t) => sum + t.connectedUsers, 0),
    timers: Object.entries(timers).map(([id, timer]) => {
      // Calculate current remaining time for running timers
      let currentTime = timer.remainingTime;
      if (timer.running && timer.endTime) {
        currentTime = Math.max(0, Math.floor((timer.endTime - now) / 1000));
      }
      return {
        id: id.substring(0, 8) + '...',
        connectedUsers: timer.connectedUsers,
        running: timer.running,
        time: currentTime,
        inactiveMins: Math.round((now - timer.lastActivity) / 60000),
      };
    }),
  };
  res.json(stats);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  let currentTimerId = null;

  // User joins a timer room
  socket.on('joinTimer', (timerId) => {
    // Validate timer ID
    if (!timerId || typeof timerId !== 'string') {
      socket.emit('error', { message: 'Invalid timer ID format' });
      return;
    }

    // Check if timer exists
    if (!timers[timerId]) {
      socket.emit('error', { message: 'Timer not found. Please check the timer ID and try again.' });
      console.log(`User attempted to join non-existent timer: ${timerId}`);
      return;
    }

    // Leave previous room if any
    if (currentTimerId && timers[currentTimerId]) {
      socket.leave(currentTimerId);
      timers[currentTimerId].connectedUsers--;
      console.log(`User left timer: ${currentTimerId} (${timers[currentTimerId].connectedUsers} users remaining)`);
    }

    // Join new room
    socket.join(timerId);
    currentTimerId = timerId;
    timers[timerId].connectedUsers++;
    timers[timerId].lastActivity = Date.now();

    // Send current timer state to new user
    const timer = timers[timerId];
    
    // Calculate current remaining time if timer is running
    let currentRemaining = timer.remainingTime;
    if (timer.running && timer.endTime) {
      currentRemaining = Math.max(0, Math.floor((timer.endTime - Date.now()) / 1000));
    }
    
    socket.emit('timerState', {
      duration: timer.duration,
      remainingTime: currentRemaining,
      endTime: timer.endTime,
      running: timer.running,
    });
    socket.emit('joinSuccess', { message: 'Successfully joined timer!' });
    console.log(`User joined timer: ${timerId} (${timers[timerId].connectedUsers} users connected)`);
  });

  // Timer control events - these work on the currentTimerId
  // Moved outside joinTimer to avoid duplicate listeners
  
  // Set the duration for countdown (in seconds)
  socket.on('setDuration', (durationInSeconds) => {
    if (!currentTimerId) {
      console.log('[Server] setDuration called but no timer joined');
      return;
    }
    console.log(`[Server] Setting duration for ${currentTimerId}: ${durationInSeconds} seconds`);
    if (timers[currentTimerId] && !timers[currentTimerId].running) {
      timers[currentTimerId].duration = durationInSeconds;
      timers[currentTimerId].remainingTime = durationInSeconds;
      timers[currentTimerId].lastActivity = Date.now();

      // Broadcast new duration to all users
      io.to(currentTimerId).emit('durationSet', {
        duration: durationInSeconds,
        remainingTime: durationInSeconds,
      });
      console.log(`Timer ${currentTimerId} duration set to ${durationInSeconds} seconds`);
    }
  });
  
  socket.on('startTimer', () => {
    if (!currentTimerId) {
      console.log('[Server] startTimer called but no timer joined');
      return;
    }
    console.log(`[Server] Received startTimer for ${currentTimerId}`);
    if (timers[currentTimerId] && !timers[currentTimerId].running) {
      const timer = timers[currentTimerId];
      
      // Can't start if no duration set
      if (timer.remainingTime <= 0) {
        console.log(`[Server] Cannot start timer ${currentTimerId}: no duration set`);
        socket.emit('error', { message: 'Please set a duration first' });
        return;
      }
      
      timer.running = true;
      timer.endTime = Date.now() + (timer.remainingTime * 1000);
      timer.lastActivity = Date.now();

      // Broadcast start event with end timestamp to all users in the room
      io.to(currentTimerId).emit('timerStarted', {
        endTime: timer.endTime,
        remainingTime: timer.remainingTime,
      });
      console.log(`Timer ${currentTimerId} started, will end at ${timer.endTime}`);
      
      // Check when timer completes
      const checkInterval = setInterval(() => {
        if (!timers[currentTimerId] || !timers[currentTimerId].running) {
          clearInterval(checkInterval);
          return;
        }
        
        const remaining = Math.max(0, Math.floor((timers[currentTimerId].endTime - Date.now()) / 1000));
        
        if (remaining === 0) {
          clearInterval(checkInterval);
          timers[currentTimerId].running = false;
          timers[currentTimerId].remainingTime = 0;
          timers[currentTimerId].endTime = null;
          
          // Notify all users that timer completed
          io.to(currentTimerId).emit('timerCompleted');
          console.log(`Timer ${currentTimerId} completed!`);
        }
      }, 1000);
    } else {
      console.log(`[Server] Cannot start timer ${currentTimerId}: exists=${!!timers[currentTimerId]}, running=${timers[currentTimerId]?.running}`);
    }
  });

  socket.on('stopTimer', () => {
    if (!currentTimerId) {
      console.log('[Server] stopTimer called but no timer joined');
      return;
    }
    console.log(`[Server] Received stopTimer for ${currentTimerId}`);
    if (timers[currentTimerId] && timers[currentTimerId].running) {
      // Calculate remaining time before stopping
      const remaining = Math.max(0, Math.floor((timers[currentTimerId].endTime - Date.now()) / 1000));
      timers[currentTimerId].remainingTime = remaining;
      timers[currentTimerId].running = false;
      timers[currentTimerId].endTime = null;
      timers[currentTimerId].lastActivity = Date.now();

      // Broadcast stop event with remaining time to all users in the room
      io.to(currentTimerId).emit('timerStopped', {
        remainingTime: remaining,
      });
      console.log(`Timer ${currentTimerId} stopped with ${remaining} seconds remaining`);
    }
  });

  socket.on('resetTimer', () => {
    if (!currentTimerId) {
      console.log('[Server] resetTimer called but no timer joined');
      return;
    }
    console.log(`[Server] Received resetTimer for ${currentTimerId}`);
    if (timers[currentTimerId]) {
      const timer = timers[currentTimerId];
      timer.endTime = null;
      timer.remainingTime = timer.duration; // Reset to original duration
      timer.running = false;
      timer.lastActivity = Date.now();

      // Notify all users of reset
      io.to(currentTimerId).emit('timerReset', {
        duration: timer.duration,
        remainingTime: timer.duration,
      });
      console.log(`Timer ${currentTimerId} reset to ${timer.duration} seconds`);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (currentTimerId && timers[currentTimerId]) {
      timers[currentTimerId].connectedUsers--;
      console.log(`User disconnected from timer: ${currentTimerId} (${timers[currentTimerId].connectedUsers} users remaining)`);

      // If no users left and timer is not running, schedule for cleanup
      if (timers[currentTimerId].connectedUsers === 0) {
        timers[currentTimerId].lastActivity = Date.now();
      }
    }
  });
});

// Update last activity for running timers (no broadcast needed)
// Clients calculate time locally from timestamps
setInterval(() => {
  for (const timer of Object.values(timers)) {
    if (timer.running) {
      timer.lastActivity = Date.now(); // Update activity time for running timers
    }
  }
}, 60000); // Check every minute instead of every second

// Cleanup inactive timers periodically
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [id, timer] of Object.entries(timers)) {
    const inactiveTime = now - timer.lastActivity;

    // Delete timer if:
    // 1. No users connected AND inactive for longer than timeout
    // 2. OR timer has been inactive for a very long time (regardless of users)
    if (
      (timer.connectedUsers === 0 && inactiveTime > INACTIVITY_TIMEOUT) ||
      inactiveTime > INACTIVITY_TIMEOUT * 4 // 2 hours absolute max
    ) {
      delete timers[id];
      cleanedCount++;
      console.log(`Cleaned up inactive timer: ${id} (inactive for ${Math.round(inactiveTime / 60000)} minutes)`);
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleanup complete: removed ${cleanedCount} timer(s). Active timers: ${Object.keys(timers).length}`);
  }
}, CLEANUP_INTERVAL);

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});