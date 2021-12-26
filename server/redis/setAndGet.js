let { promisify } = require("util");
let redisClient   = require('./redis');
let setAsync      = promisify(redisClient.set).bind(redisClient);
let getAsync      = promisify(redisClient.get).bind(redisClient);  
let delAsync      = promisify(redisClient.del).bind(redisClient);

module.exports.get = async function(){
    return JSON.parse(await getAsync(this.id));
}
module.exports.set = async function(obj){
    let data = await JSON.parse(await getAsync(this.id));
	if(data) { 
		for (let [key, value] of Object.entries(obj)) data[key] = value;
		await setAsync(this.id, JSON.stringify(data));
	} else { 
		await setAsync(this.id, JSON.stringify(obj));
	}
}
module.exports.delete = async function(key){ await delAsync(key); }
