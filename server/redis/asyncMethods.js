let { promisify } = require("util");
let redisClient = require('./redis');
let setAsync = promisify(redisClient.set).bind(redisClient);
let getAsync = promisify(redisClient.get).bind(redisClient);
let delAsync = promisify(redisClient.del).bind(redisClient);
let saddAsync = promisify(redisClient.sadd).bind(redisClient); 
let rpushAsync = promisify(redisClient.rpush).bind(redisClient);
let lpushAsync = promisify(redisClient.lpush).bind(redisClient);
let lrangeAsync = promisify(redisClient.lrange).bind(redisClient);
let llenAsync = promisify(redisClient.llen).bind(redisClient);
let lremAsync = promisify(redisClient.lrem).bind(redisClient);
let lindexAsync = promisify(redisClient.lindex).bind(redisClient);
let sremAsync = promisify(redisClient.srem).bind(redisClient); 
let sismemberAsync = promisify(redisClient.sismember).bind(redisClient); 
let scanAsync = promisify(redisClient.scan).bind(redisClient); 
let sscanAsync = promisify(redisClient.sscan).bind(redisClient);
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

module.exports.sadd = async (key, ...member) => await saddAsync(key, member);

module.exports.rpush = async (key, ...values) => await rpushAsync(key, values);

module.exports.lpush = async (key, ...values) => await lpushAsync(key, values);

module.exports.lrange = async (key, start, end) => await lrangeAsync(key, start, end);

module.exports.llen = async key => await llenAsync(key);

module.exports.lrem = async (key, count, elem) => await lremAsync(key, count, elem);
  
module.exports.lindex = async (key, index) => await lindexAsync(key, index);
// Commands like SMEMBERS can block the server
// SMEMBERS command has been replaced with a non-blocking SSCAN
module.exports.smembers = async (key, match="*", count=10) => { 
	let cursor = 0, res = [];

    while(cursor !== '0'){
        let scan_res = await sscanAsync(key, cursor, 'MATCH', match, 'COUNT', count);
        cursor = scan_res[0];
        res.push(...scan_res[1]);
    }
    return res;
}

module.exports.sismember = async (key, member) => await sismemberAsync(key, member);

module.exports.srem = async (key, member) => await sremAsync(key, member);

module.exports.delete = async key => await delAsync(key);

module.exports.dbSize = async () => await dbSizeAsync();

module.exports.scan = async (cursor, match, count, type) => await scanAsync(cursor, 'MATCH', match, 'COUNT', count, 'TYPE', type);