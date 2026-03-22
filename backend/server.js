require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./socket');
const auctionStore = require('./auctionStore');

const server = http.createServer(app);
const io = initSocket(server);

const PORT = process.env.PORT || 3000;
const BREAK_DURATION_MS = 10000; // 10 seconds break between auctions
const TICK_RATE_MS = 1000; // 1 second interval

// Background interval driving the end/break/restart lifecycle
setInterval(() => {
  const items = auctionStore.getAll();
  const now = Date.now();
  let stateChanged = false;

  items.forEach(item => {
    if (item.status === 'active') {
      if (now >= item.endTime) {
        // Auction ended, enter break phase
        auctionStore.setItemBreakStartTime(item.id, now);
        stateChanged = true;
      }
    } else if (item.status === 'break') {
      if (item.breakStartTime !== null && now >= item.breakStartTime + BREAK_DURATION_MS) {
        // Break is over, restart the auction
        auctionStore.resetItem(item.id);
        stateChanged = true;
      }
    }
  });

  // If any item changed state, broadcast the updated state to clients
  if (stateChanged) {
    // Clients can listen to STATE_UPDATE to sync with lifecycle changes
    io.emit('STATE_UPDATE', auctionStore.getAll());
  }
}, TICK_RATE_MS);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
