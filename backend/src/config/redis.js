const { createClient } = require('redis');
require('dotenv').config();
const redisClient = createClient({
     username: 'default',
    password: '2hODpMAPkzdtgPxOf5wpmIJJTmIOpoXs',
    socket: {
        host: 'redis-14553.c262.us-east-1-3.ec2.cloud.redislabs.com',
        port: 14553
    }
});

// Handle Redis connection errors to prevent the app from crashing
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message || err);
});

module.exports = redisClient;
