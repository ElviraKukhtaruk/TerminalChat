let redis = require('../redis/setAndGet');

module.exports = {

	_requests: { },

	addRequest: function(_case, func) {
		this._requests[_case] = this._requests[_case] || [];
		this._requests[_case].push(func);
	},

	_switch: function(data, socket){
		this._requests[data.header.type].forEach(func => func(socket, data))
	},

	matchRequestType: async function(socket, request) {
		let data = socket.get(request, true);
		if (socket.status === 'auth' && data.header.type === 'log_in' || socket.token) {
			this._requests[data.header.type] ? this._switch(data, socket) : socket.error('Request not found', data.header.type);
		} else socket.error('You are not logged in', data.header.type);
	}

}
