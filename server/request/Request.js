let redis = require('../redis/setAndGet');
let handshake = require('../handshake/ECDHHandshake');
let error = require('./requests/error');

module.exports = {

	_requests: { },
	// Create new entry, for example: addRequest('request_type', callback);
	addRequest: function(_case, func) {
		this._requests[_case] = this._requests[_case] || [];
		this._requests[_case].push(func);
	},
	// Looking for a suitable function to match the request
	_switch: function(data, socket, session) {
		this._requests[data.header.type].forEach(async func => {
			try {
				await func(socket, data, session);
			} catch(err) {
				error(socket, req, err);
			} 
		});
	},

	_matchRequestType: async function(socket, request) {
		let data = socket.get(request, true), session = socket.token ? await redis.get(socket.token) : null;
		let allowedRequests = ['log_in', 'registration'];
		// To send requests of a special type, user needs to log in / register
		if (allowedRequests.includes(data.header.type) || session) {
			// Depending on the type of request, perform the desired function
			this._requests[data.header.type] ? this._switch(data, socket, session) : socket.error('Request not found', data.header.type);
		} else socket.error('You are not logged in', data.header.type);
	},

	checkUserStatus: async function(data){
		try {
			// When the socket status is "auth" then the user has finished the ECDH handshake
			if (this.socket.status === 'auth') await this.Request._matchRequestType(this.socket, data);
			else handshake.ECDH(this.socket, data); 
		} catch(err) {
			console.log(`${this.socket.remoteAddress} - ${this.socket.status} - An error occurred while receiving data: ${err}`);
			if (this.socket.status === 'auth') this.socket.error('Error during data validation on the server');
		}
	}

}
