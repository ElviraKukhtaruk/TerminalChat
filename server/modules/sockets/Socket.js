let redis = require('../../redis/setAndGet');

module.exports = {
	_Sockets: new Map(),

	getSocket: function(id){
		return this._Sockets.get(id);
	},

	addSocket: function(id, value){
		this._Sockets.set(id, value);
	},
	deleteSocket: async function(socket){
		let token;
		if(this.getSocket(socket.id).currentChat) await redis.srem(this.getSocket(socket.id).currentChat, socket.id);
		if(socket.token){ 
			token = await redis.get(socket.token);
			await redis.delete(token.user_id);
		} this._Sockets.delete(socket.id);
	}
}