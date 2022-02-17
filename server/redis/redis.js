const redis = require("redis");
const conf = require('../configuration/mainConfig');

const client = redis.createClient({
	host: conf.REDIS.host,
	port: conf.REDIS.port,
});

client.on("error", function(error) {
	console.error(error);
});

client.on('connect', function() {
	console.log('Redis connected');
});

module.exports = client;
