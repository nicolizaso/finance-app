const mongoose = require('mongoose');
const User = require('./server/models/User');

// Connect to DB (Same as index.js logic usually, but I need the URI)
// In index.js it starts MemoryServer if no URI.
// I can't easily connect to the SAME MemoryServer process.
// I have to register via API if possible, OR
// Since I can't register via API (no register endpoint in users.js),
// I must have missed how users are created.
// Maybe there is a seed script?

// Let's check server/index.js to see if it seeds data.
