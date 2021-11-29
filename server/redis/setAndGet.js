let { promisify }   = require("util");
let redisClient     = require('./redis');
let setAsync        = promisify(redisClient.set).bind(redisClient);
let getAsync        = promisify(redisClient.get).bind(redisClient);  
let delAsync        = promisify(redisClient.del).bind(redisClient);

module.exports.get = async (key, isObject) => {
    return isObject ? JSON.parse(await getAsync(key)) : await getAsync(key);
}
module.exports.set = async (key, value, isObject) =>{
    return isObject ? await setAsync(key, JSON.stringify(value)) : await setAsync(key, value); 
}
module.exports.delete = async(key) => await delAsync(key); 
