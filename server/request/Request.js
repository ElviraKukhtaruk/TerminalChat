let redis = require('../redis/setAndGet');

module.exports = {

	_requests: { },

	addRequest: function(_case, func) {
		this._requests[_case] = this._requests[_case] || [];
		this._requests[_case].push(func);
	},

	_switch: function(data, socket, session){
		this._requests[data.header.type].forEach(func => func(socket, data, session))
	},

	matchRequestType: async function(socket, request) {
		let data = socket.get(request, true), session = socket.token ? await redis.get(socket.token) : null;
		if (data.header.type === 'log_in' || session) {
			this._requests[data.header.type] ? this._switch(data, socket, session) : socket.error('Request not found', data.header.type);
		} else socket.error('You are not logged in', data.header.type);
	}

}
