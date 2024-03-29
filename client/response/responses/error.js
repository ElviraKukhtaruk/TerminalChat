let Response = require('../Response');
let logIn = require('../../modules/auth/logIn');

Response.addResponse('error', async (client, res) => {
	let requestType = res.header.previousType ? `Request type: ${res.header.previousType}` : '';
	console.log(`\nError response: ${res.body.message}. ${requestType}`);
	if (res.header.previousType === 'log_in' || res.header.previousType === 'registration') await logIn(client);
});
