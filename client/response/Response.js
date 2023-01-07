let handshake = require('../handshake/ECDHHandshake');

module.exports = {

	_responses: [ ],
	
	// When the response is added with the `autoRemove` parameter, then after executing the function - delete it.
	_autoRemove: [ ],

	_matchResponseType: function(client, request) {
		let data = client.get(request, true), type = data.header.type;
		// Depending on the type of response, perform the desired function
		if(this._responses[type]) this._responses[type].forEach(async func => { 
			try {
				await func(client, data);
			} catch(err) {
				console.log(`An error occurred while receiving a response from the server, type: ${data.header.type}: ${err}`);
			}
		}); else console.log(`Response not found: ${type}`);
		if(this._autoRemove.includes(type)){
			this._responses[type] = [];
			this._autoRemove = this._autoRemove.filter(e => e != type);
		}
	},

	checkClientStatus: function(data) {
		try {
			// When the socket status is "auth" then the user has finished the ECDH handshake
			if(this.client.status === 'auth') this.Response._matchResponseType(this.client, data);
			else handshake.ECDH(this.client, data);
		} catch(err) {
			console.log(`${this.client.status} - An error occurred while receiving data: ${err}`);
		}
	},

	// Create new entry, for example: addResponse('response_type', callback);
	addResponse: function(_case, func, autoRemove) {
		this._responses[_case] = this._responses[_case] || [];
		this._responses[_case].push(func);
		if(autoRemove) this._autoRemove.push(_case);
	},

	addResponses: function(responses, func, autoRemove) {
		responses.forEach(response => this.addResponse(response, func, autoRemove));
	}

}
