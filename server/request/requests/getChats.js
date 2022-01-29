let User 		  = require('../../mongodb/schemas/userSchema');
let Conversations = require('../../mongodb/schemas/conversation');
let redis		  = require('../../redis/setAndGet');

module.exports = async (socket, req) => {
	try {
		let session = await redis.get(socket.token);
		let user = await User.findById(session.user_id);
		socket.send({header: {type: 'get_chats'}, body: {conversations: user.conversations, ownConversations: user.ownConversations}});
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} An error occurred while while receiving data, type: ${req.header.type}: ${err}`);
		socket.error('Check the correctness of the sent data', req.header.type);
	}
}