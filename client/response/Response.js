module.exports = {

	_responses: { },

	addResponse: function(_case, func){
		this._responses[_case] = this._responses[_case] || [];
		this._responses[_case].push(func);
	},

	matchResponseType: function(socket, request){
		let data = socket.get(request, true);
		if(this._responses[data.header.type]) this._responses[data.header.type].forEach(func => func(socket, data));
		else console.log('Request not found');
	}

}
