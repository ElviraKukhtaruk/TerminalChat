let Response = require('../Response');
let file = require('../../../shared/AsyncFileOperations');

let logIn = async (client, res) => {
	try {
		if(res.body.token) await file.write(`./token`, res.body.token);
		client.send({header: {type: 'myChats'}, body: {} });
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

Response.addResponse('log_in', logIn);
Response.addResponse('registration', logIn);
