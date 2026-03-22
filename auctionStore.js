// auctionStore.js

const AUCTION_ITEMS_TEMPLATE = [
  { id: '1', name: 'Vintage Rolex Daytona', startingBid: 5000, durationSeconds: 30 },
  { id: '2', name: 'Original Picasso Sketch', startingBid: 12000, durationSeconds: 45 },
  { id: '3', name: 'Signed Michael Jordan Jersey', startingBid: 8000, durationSeconds: 60 },
  { id: '4', name: '1969 Fender Stratocaster', startingBid: 3000, durationSeconds: 90 },
  { id: '5', name: 'First Edition Harry Potter', startingBid: 500, durationSeconds: 120 }
];

let itemsStore = {};

function initStore() {
  const now = Date.now();
  AUCTION_ITEMS_TEMPLATE.forEach(template => {
    itemsStore[template.id] = {
      id: template.id,
      name: template.name,
      currentBid: template.startingBid,
      highestBidder: null,
      status: 'active', 
      endTime: now + template.durationSeconds * 1000,
      breakStartTime: null,
      durationSeconds: template.durationSeconds,
      startingBid: template.startingBid
    };
  });
}

initStore();

function getAll() {
  return Object.values(itemsStore);
}

function getById(id) {
  return itemsStore[id];
}

function setItemBreakStartTime(id, timeMs) {
  if (itemsStore[id]) {
    itemsStore[id].status = 'break';
    itemsStore[id].breakStartTime = timeMs;
  }
}

function resetItem(id) {
  if (itemsStore[id]) {
    const item = itemsStore[id];
    item.status = 'active';
    item.currentBid = item.startingBid;
    item.highestBidder = null;
    item.endTime = Date.now() + item.durationSeconds * 1000;
    item.breakStartTime = null;
  }
}

module.exports = {
  getAll,
  getById,
  setItemBreakStartTime,
  resetItem
};
