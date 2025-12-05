const { createClient } = require('redis');
require('dotenv').config();
const redisClient = createClient({
    username: 'default',
    password: '1qP8EdOAA4dOz4WEJFnmPcJZEZddHHlZ',
    socket: {
        host: 'redis-18216.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 18216
    }
});

module.exports=redisClient;
