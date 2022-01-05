module.exports = {
	_Sockets: new Map(),

	getSocket: function(id){
		return this._Sockets.get(id);
	},

	addSocket: function(id, value){
		this._Sockets.set(id, value);
	},
	deleteSocket: function(id){
		this._Sockets.delete(id);
	}
}
