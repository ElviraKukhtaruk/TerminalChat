let redis = require('./setAndGet');
let redisSession = require('./userSessions');

module.exports = async () => {
	console.log('\nDeleting all chats and sessions from redis...');
	let dbSize = await redis.dbSize();
    if(dbSize){ 
        let allChats = await redisSession.find('*', 50, 'set');
        if (allChats) for (const chat of allChats) {
            await redis.delete(chat);
        }
        let allSessions = await redisSession.find('*', dbSize);
        if (allChats) for (const session of allSessions) {
            await redis.delete(session);
        }
        
	}
	console.log('All chats have been deleted');
    process.exit();
}