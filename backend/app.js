const express = require('express');
const cors = require('cors');
const auctionStore = require('./auctionStore');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', serverTime: Date.now() });
});

// Get all auction items endpoint
app.get('/items', (req, res) => {
  const items = auctionStore.getAll();
  res.status(200).json(items);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
