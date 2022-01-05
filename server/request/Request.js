module.exports = {

	_requests: { },

	addRequest: function(_case, func) {
		this._requests[_case] = this._requests[_case] || [];
		this._requests[_case].push(func);
	},
	// This function work like switch(value)
	matchRequestType: function(socket, request) {
		let data = socket.get(request, true);
		if (socket.status === 'auth' && data.header.type === 'log_in' || socket.status === 'full_auth') {
			this._requests[data.header.type] ? this._requests[data.header.type].forEach(func => func(socket, data)) : 
								socket.error('Request not found', data.header.type);
		} else socket.error('You are not logged in', data.header.type);
	}

}
