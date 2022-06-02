module.exports = {


	_responses: [ ],

	_autoRemove: [ ],

	// Create new entry, for example: addResponse('response_type', callback);
	addResponse: function(_case, func, autoRemove){
		this._responses[_case] = this._responses[_case] || [];
		this._responses[_case].push(func);
		if(autoRemove) this._autoRemove.push(_case);
	},

	matchResponseType: function(client, request){
		let data = client.get(request, true), type = data.header.type;
		// Depending on the type of response, perform the desired function
		if(this._responses[type])this._responses[type].forEach(func => func(client, data));
		else console.log(`Response not found: ${type}`);
		if(this._autoRemove.includes(type)){ 
			this._responses[type] = [];
			this._autoRemove = this._autoRemove.filter(e => e != type);
		}
	}

}
