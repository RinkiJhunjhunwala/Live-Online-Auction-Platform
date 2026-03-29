const { createClient } = require('redis');

// In production, we would use process.env.REDIS_URL.
// For local development, it defaults to standard local redis.
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({ url: redisUrl });
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

// Error handling
redisClient.on('error', (err) => console.error('Redis Client Error', err));
pubClient.on('error', (err) => console.error('Redis PubClient Error', err));
subClient.on('error', (err) => console.error('Redis SubClient Error', err));

async function connectRedis() {
  await redisClient.connect();
  await pubClient.connect();
  await subClient.connect();
  console.log('✅ Connected to Redis Database');
}

module.exports = {
  redisClient,
  pubClient,
  subClient,
  connectRedis
};
