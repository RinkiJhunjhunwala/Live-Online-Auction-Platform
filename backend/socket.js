const { Server } = require('socket.io');
const auctionStore = require('./auctionStore');
const { createAdapter } = require('@socket.io/redis-adapter');
const { pubClient, subClient } = require('./redisClient');

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: true, // Reflects the requesting origin dynamically
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true
    }
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('BID_PLACED', async (data) => {
      const { itemId, bidAmount, userId } = data;
      
      const result = await auctionStore.placeBid(itemId, bidAmount, userId);
      
      if (result.error) {
        return socket.emit('BID_ERROR', { itemId, error: result.error });
      }

      // Fetch newly updated item data to send out
      const updatedItem = await auctionStore.getById(itemId);

      // Broadcast the updated item to all clients attached to any backend node via adapter
      io.emit('UPDATE_BID', updatedItem);

      if (result.previousBidder && result.previousBidder !== userId) {
        io.emit('OUTBID', { itemId, outbidUserId: result.previousBidder });
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
