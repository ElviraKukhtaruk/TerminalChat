let Response = require('../Response');
let login = require('../../modules/auth/logIn');

Response.addResponse('error', async (client, res) => {
	try {
		let requestType = res.header.previousType ? `Request type: ${res.header.previousType}` : '';
		console.log(`Error response: ${res.body.message}. ${requestType}`);
		if (res.header.previousType === 'log_in' || res.header.previousType === 'registration') await login(client);
		
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
});
