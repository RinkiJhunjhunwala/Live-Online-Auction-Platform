require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const auctionStore = require('./auctionStore');
const { connectRedis } = require('./redisClient');

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 3000;
const BREAK_DURATION_MS = 10000; // 10 seconds break between auctions
const TICK_RATE_MS = 1000; // 1 second interval

connectRedis().then(async () => {
  await auctionStore.initStore();
  
  // Background loop for timers
  setInterval(async () => {
    try {
      const items = await auctionStore.getAll();
      const now = Date.now();
      let stateChanged = false;

      for (const item of items) {
        if (item.status === 'active' && now >= item.endTime) {
          await auctionStore.setItemBreakStartTime(item.id, now);
          stateChanged = true;
        } else if (item.status === 'break' && item.breakStartTime > 0 && now >= item.breakStartTime + BREAK_DURATION_MS) {
          await auctionStore.resetItem(item.id);
          stateChanged = true;
        }
      }

      if (stateChanged) {
        const updatedItems = await auctionStore.getAll();
        io.emit('STATE_UPDATE', updatedItems);
      }
    } catch (err) {
      console.error("Interval sync error", err);
    }
  }, TICK_RATE_MS);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to connect to Redis. Shutting down.", err);
  process.exit(1);
});
