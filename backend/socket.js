const { Server } = require('socket.io');
const auctionStore = require('./auctionStore');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "https://live-online-auction-platform.vercel.app",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('BID_PLACED', (data) => {
      const { itemId, bidAmount, userId } = data;
      const item = auctionStore.getById(itemId);

      // Validate item exists
      if (!item) {
        return socket.emit('BID_ERROR', { itemId, error: 'Item not found' });
      }

      // Validate auction is active
      if (item.status !== 'active') {
        return socket.emit('BID_ERROR', { itemId, error: 'Auction is not currently active' });
      }

      // Validate time
      if (Date.now() > item.endTime) {
        return socket.emit('BID_ERROR', { itemId, error: 'Auction has already ended' });
      }

      // Validate bid amount
      if (bidAmount <= item.currentBid) {
        return socket.emit('BID_ERROR', { itemId, error: `Bid must be higher than the current bid of ${item.currentBid}` });
      }

      const previousHighestBidder = item.highestBidder;

      // Update store state
      item.currentBid = bidAmount;
      item.highestBidder = userId;

      // Broadcast the updated item to all clients
      io.emit('UPDATE_BID', item);

      // If there was a previous bidder and it's not the same user, broadcast an OUTBID event
      if (previousHighestBidder && previousHighestBidder !== userId) {
        io.emit('OUTBID', { itemId, outbidUserId: previousHighestBidder });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
}

module.exports = { initSocket, getIo };
