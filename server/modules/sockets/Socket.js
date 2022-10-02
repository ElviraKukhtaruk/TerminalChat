let redis = require('../../redis/asyncMethods');
let sessionRedis = require('../../redis/userSessions');

module.exports = {
	_Sockets: new Map(),

	getSocket: function(id){
		return this._Sockets.get(id);
	},

	addSocket: function(id, value){
		this._Sockets.set(id, value);
	},
	deleteSocket: async function(socket){
		// Remove the user from the chat where they were member while disconnecting
		let findSocket = this.getSocket(socket.id);
		if(findSocket && findSocket.currentChat) await redis.srem(findSocket.currentChat, socket.id);
		let user_session = await sessionRedis.find(`*:${socket.id}`, 1);
		if(user_session) await redis.delete(user_session[0]);
		this._Sockets.delete(socket.id);
	}
}