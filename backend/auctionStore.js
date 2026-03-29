// auctionStore.js
const { redisClient } = require('./redisClient');

const AUCTION_ITEMS_TEMPLATE = [
  { id: '1', name: 'Vintage Rolex Daytona', startingBid: 1000, durationSeconds: 30 },
  { id: '2', name: 'Original Picasso Sketch', startingBid: 2500, durationSeconds: 45 },
  { id: '3', name: 'Signed Michael Jordan Jersey', startingBid: 500, durationSeconds: 60 },
  { id: '4', name: '1969 Fender Stratocaster', startingBid: 250, durationSeconds: 90 },
  { id: '5', name: 'First Edition Harry Potter', startingBid: 100, durationSeconds: 120 }
];

async function initStore() {
  const now = Date.now();
  for (const template of AUCTION_ITEMS_TEMPLATE) {
    const exists = await redisClient.exists(`auction:${template.id}`);
    // Initialize if it doesn't exist
    if (!exists) {
      await redisClient.hSet(`auction:${template.id}`, {
        id: template.id,
        name: template.name,
        currentBid: template.startingBid,
        highestBidder: '', // Redis hashes can't store true 'null', using empty string
        status: 'active', 
        endTime: now + template.durationSeconds * 1000,
        breakStartTime: 0,
        durationSeconds: template.durationSeconds,
        startingBid: template.startingBid
      });
    }
  }
}

// Helper to convert Redis hash string values back to application types
function parseItem(item) {
  if (!item || !item.id) return null;
  return {
    ...item,
    currentBid: Number(item.currentBid),
    endTime: Number(item.endTime),
    breakStartTime: Number(item.breakStartTime),
    durationSeconds: Number(item.durationSeconds),
    startingBid: Number(item.startingBid),
    highestBidder: item.highestBidder === '' ? null : item.highestBidder
  };
}

async function getAll() {
  const items = [];
  // Use templates to know which keys exist consistently
  for (const template of AUCTION_ITEMS_TEMPLATE) {
    const item = await redisClient.hGetAll(`auction:${template.id}`);
    if (Object.keys(item).length > 0) {
      items.push(parseItem(item));
    }
  }
  return items;
}

async function getById(id) {
  const item = await redisClient.hGetAll(`auction:${id}`);
  return parseItem(item);
}

// Atomic Lua script for Race-Free Redis Bidding
const placeBidLua = `
  local id = KEYS[1]
  local newBid = tonumber(ARGV[1])
  local userId = ARGV[2]
  local now = tonumber(ARGV[3])
  
  -- Check existence
  local exists = redis.call('EXISTS', id)
  if exists == 0 then return {err = "Item not found"} end

  -- Check status
  local status = redis.call('HGET', id, 'status')
  if status ~= 'active' then return {err = "Auction is not currently active"} end
  
  -- Check endTime
  local endTime = tonumber(redis.call('HGET', id, 'endTime'))
  if now > endTime then return {err = "Auction has already ended"} end
  
  -- Check bid amount
  local currentBid = tonumber(redis.call('HGET', id, 'currentBid'))
  if newBid <= currentBid then return {err = "Bid must be higher than the current bid of " .. currentBid} end
  
  -- Anti-Sniping (Soft Close)
  -- If a bid is placed within the final 30 seconds (30000ms), 
  -- mathematically extend the auction to ensure exactly 30 full seconds remain for counter bids
  local timeRemaining = endTime - now
  if timeRemaining <= 30000 then
     endTime = now + 30000
     redis.call('HSET', id, 'endTime', tostring(endTime))
  end
  
  -- Update
  local previousBidder = redis.call('HGET', id, 'highestBidder')
  redis.call('HSET', id, 'currentBid', tostring(newBid))
  redis.call('HSET', id, 'highestBidder', userId)
  
  return previousBidder
`;

async function placeBid(id, bidAmount, userId) {
  try {
    const previousBidder = await redisClient.eval(placeBidLua, {
      keys: [`auction:${id}`],
      arguments: [bidAmount.toString(), userId, Date.now().toString()]
    });
    return { success: true, previousBidder: previousBidder === '' ? null : previousBidder };
  } catch (error) {
    // If the error originated from our script {err = ...}, Redis prepends ERR Error running script...
    const errMessage = error.message.includes("Auction is not currently active") ? "Auction is not currently active" 
                     : error.message.includes("Auction has already ended") ? "Auction has already ended" 
                     : error.message.includes("Bid must be higher") ? error.message.split('Bid must be higher')[1] ? "Bid must be higher" + error.message.split('Bid must be higher')[1].trim() : "Bid must be higher than current bid"
                     : error.message.includes("Item not found") ? "Item not found" 
                     : error.message;
    return { error: errMessage };
  }
}

async function setItemBreakStartTime(id, timeMs) {
  await redisClient.hSet(`auction:${id}`, 'status', 'break');
  await redisClient.hSet(`auction:${id}`, 'breakStartTime', timeMs.toString());
}

async function resetItem(id) {
  const item = await getById(id);
  if (item) {
    const endTime = Date.now() + item.durationSeconds * 1000;
    await redisClient.hSet(`auction:${id}`, {
      status: 'active',
      currentBid: item.startingBid,
      highestBidder: '',
      endTime: endTime.toString(),
      breakStartTime: '0'
    });
  }
}

module.exports = {
  initStore,
  getAll,
  getById,
  placeBid,
  setItemBreakStartTime,
  resetItem
};
