const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/vessels', require('./routes/vessels'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/catches', require('./routes/catches'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/violations', require('./routes/violations'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join_vessel', (vesselId) => { socket.join(`vessel_${vesselId}`); });
  socket.on('join_tracking', () => { socket.join('tracking_room'); });
  socket.on('disconnect', () => { console.log('Client disconnected:', socket.id); });
});

app.set('io', io);

const { startSimulation } = require('./services/simulation');
startSimulation(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MarineGuard server running on port ${PORT}`);
});

module.exports = { app, server, io };
