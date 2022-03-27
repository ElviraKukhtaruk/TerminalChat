let { promisify } = require("util");
let redisClient = require('./redis');
let setAsync = promisify(redisClient.set).bind(redisClient);
let getAsync = promisify(redisClient.get).bind(redisClient);
let delAsync = promisify(redisClient.del).bind(redisClient);
let saddAsync = promisify(redisClient.sadd).bind(redisClient); 
let smembersAsync = promisify(redisClient.smembers).bind(redisClient); 
let sremAsync = promisify(redisClient.srem).bind(redisClient); 
let sismemberAsync = promisify(redisClient.sismember).bind(redisClient); 
let scanAsync = promisify(redisClient.scan).bind(redisClient); 
let dbSizeAsync = promisify(redisClient.dbsize).bind(redisClient); 

module.exports.get = async key => {
	return JSON.parse(await getAsync(key));
}
module.exports.set = async (key, obj) =>{
	let data = await JSON.parse(await getAsync(key));
	if(data) { 
		for (let [key, value] of Object.entries(obj)) data[key] = value;
		await setAsync(key, JSON.stringify(data), 'EX', 60*60*24);
	} else await setAsync(key, JSON.stringify(obj), 'EX', 60*60*24);
}

module.exports.sadd = async (key, member) => await saddAsync(key, member);

module.exports.smembers = async key => await smembersAsync(key);

module.exports.sismember = async (key, member) => await sismemberAsync(key, member);

module.exports.srem = async (key, member) => await sremAsync(key, member);

module.exports.delete = async key => await delAsync(key);

module.exports.dbSize = async () => await dbSizeAsync();

module.exports.scan = async (cursor, match, count, type) => await scanAsync(cursor, 'MATCH', match, 'COUNT', count, 'TYPE', type);