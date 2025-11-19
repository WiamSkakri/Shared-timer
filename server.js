const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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

// Endpoint to create a new timer
app.get('/create-timer', (req, res) => {
  const timerId = generateReadableId(); // Generate unique, readable timer ID
  timers[timerId] = {
    startTime: null,      // Timestamp when timer started (null if not running)
    pausedTime: 0,        // Accumulated time in seconds when paused
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
      // Calculate current time for running timers
      let currentTime = timer.pausedTime;
      if (timer.running && timer.startTime) {
        const elapsed = Math.floor((now - timer.startTime) / 1000);
        currentTime = timer.pausedTime + elapsed;
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

    socket.emit('timerUpdate', timers[timerId]); // Send current timer state to new user
    socket.emit('joinSuccess', { message: 'Successfully joined timer!' });
    console.log(`User joined timer: ${timerId} (${timers[timerId].connectedUsers} users connected)`);

    // Start the timer
    socket.on('startTimer', () => {
      if (timers[timerId] && !timers[timerId].running) {
        timers[timerId].running = true;
        timers[timerId].lastActivity = Date.now();
        io.to(timerId).emit('timerStarted'); // Notify all users in the room
        console.log(`Timer ${timerId} started`); // Debug log
      }
    });

    // Stop the timer
    socket.on('stopTimer', () => {
      if (timers[timerId] && timers[timerId].running) {
        timers[timerId].running = false;
        timers[timerId].lastActivity = Date.now();
        io.to(timerId).emit('timerStopped'); // Notify all users in the room
        console.log(`Timer ${timerId} stopped`); // Debug log
      }
    });

    // Reset the timer
    socket.on('resetTimer', () => {
      if (timers[timerId]) {
        timers[timerId].time = 0;
        timers[timerId].running = false;
        timers[timerId].lastActivity = Date.now();
        io.to(timerId).emit('timerReset', { time: 0, running: false }); // Notify all users
        console.log(`Timer ${timerId} reset`); // Debug log
      }
    });
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

// Update timers every second
setInterval(() => {
  for (const [id, timer] of Object.entries(timers)) {
    if (timer.running) {
      timer.time += 1; // Increment time
      timer.lastActivity = Date.now(); // Update activity time for running timers
      io.to(id).emit('timerUpdate', timer); // Broadcast updated time to users in this room
      console.log(`Timer ${id} updated to ${timer.time}`); // Debug log
    }
  }
}, 1000);

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