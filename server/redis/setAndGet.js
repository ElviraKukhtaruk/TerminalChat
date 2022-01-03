let { promisify } = require("util");
let redisClient   = require('./redis');
let setAsync      = promisify(redisClient.set).bind(redisClient);
let getAsync      = promisify(redisClient.get).bind(redisClient);  
let delAsync      = promisify(redisClient.del).bind(redisClient);

module.exports.get = async function(key){
    return JSON.parse(await getAsync(key));
}
module.exports.set = async function(key, obj){
    let data = await JSON.parse(await getAsync(key));
	if(data) { 
		for (let [key, value] of Object.entries(obj)) data[key] = value;
		await setAsync(key, JSON.stringify(data));
	} else { 
		await setAsync(key, JSON.stringify(obj));
	}
}
module.exports.delete = async key => await delAsync(key);
