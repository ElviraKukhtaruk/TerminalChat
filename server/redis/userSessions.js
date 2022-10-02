let redis = require('./asyncMethods');


module.exports.find = async (pattern, count, type='list') => {
    let cursor = 0, res = [];

    while(cursor !== '0'){
        let scan_res = await redis.scan(cursor, pattern, count, type);
        cursor = scan_res[0];
        res.push(...scan_res[1]);
    }
    return res != 0 ? res : null;
}

module.exports.deleteUserFromChatByUsername = async (chat, username) => {
    let userSessions = await this.find(`${username}:*`, 5);
    for (const session of userSessions) {
        let userSession = await redis.lrange(session, 0, 1);
        await redis.srem(chat, userSession[1]);
    }
}