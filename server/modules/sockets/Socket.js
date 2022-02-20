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
		if(this.getSocket(socket.id).currentChat) await redis.srem(this.getSocket(socket.id).currentChat, socket.id);
		this._Sockets.delete(socket.id);
	}
}