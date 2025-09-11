
require('dotenv').config();
const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
  },
  password: process.env.REDIS_PASSWORD || null,
  database: parseInt(process.env.REDIS_DB) || 0, // 默认 db0
});

client.on('error', (err) => console.log('Redis Client Error', err));
client.connect().catch(console.error);

module.exports = client;