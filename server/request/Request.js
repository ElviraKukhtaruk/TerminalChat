let redis = require('../redis/setAndGet');

module.exports = {

	_requests: { },
	// Create new entry, for example: addRequest('request_type', callback);
	addRequest: function(_case, func) {
		this._requests[_case] = this._requests[_case] || [];
		this._requests[_case].push(func);
	},
	// Looking for a suitable function to match the request
	_switch: function(data, socket, session) {
		this._requests[data.header.type].forEach(func => func(socket, data, session));
	},

	matchRequestType: async function(socket, request) {
		let data = socket.get(request, true), session = socket.token ? await redis.get(socket.token) : null;
		let allowedRequests = ['log_in', 'registration'];
		// To send requests of a special type, user needs to log in / register
		if (allowedRequests.includes(data.header.type) || session) {
			// Depending on the type of request, perform the desired function
			this._requests[data.header.type] ? this._switch(data, socket, session) : socket.error('Request not found', data.header.type);
		} else socket.error('You are not logged in', data.header.type);
	}

}
