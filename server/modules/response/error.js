module.exports = function(message, requestType){
	try {
		let errorResponse = { 
			header: {
				type: 'error', 
				previousType: requestType
			}, 
			body: {
				message: message    
			}  
		};
		this.send(errorResponse);
	} catch(err) {
		console.log(`${this.remoteAddress} - ${this.status} - An error occurred during sending an error message to the client: ${err}`);
	}
}
