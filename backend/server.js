const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const { sanitize } = require('./middleware/sanitize');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(sanitize);

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trees', require('./routes/trees'));
app.use('/api/kinship', require('./routes/kinship'));
app.use('/api/superadmin', require('./routes/superadmin'));

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);

  // Start Telegram Bot in long-polling mode (ideal for local development/testing)
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (botToken) {
    const { startTelegramPolling } = require('./utils/telegramPolling');
    startTelegramPolling(botToken);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    if (global.__MONGOD__) {
      console.log('Stopping in-memory MongoDB...');
      await global.__MONGOD__.stop();
      console.log('In-memory MongoDB stopped.');
    }
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server...');
  server.close(async () => {
    console.log('HTTP server closed.');
    if (global.__MONGOD__) {
      console.log('Stopping in-memory MongoDB...');
      await global.__MONGOD__.stop();
      console.log('In-memory MongoDB stopped.');
    }
    process.exit(0);
  });
});

module.exports = app;
