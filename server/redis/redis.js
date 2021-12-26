const redis  = require("redis");
const client = redis.createClient({
    	host: '127.0.0.1',
    	port: 6379,
});


client.on("error", function(error) {
    	console.error(error);
});

client.on('connect', function() {
    	console.log('Redis connected');
});

module.exports = client;
