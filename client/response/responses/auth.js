let Response = require('../Response');
let file = require('../../../shared/AsyncFileOperations');

let logIn = async (client, res) => {
	if(res.body.token) await file.write(`./token`, res.body.token);
	client.send({header: {type: 'myChats'}, body: {} });
}

Response.addResponse('log_in', logIn);
Response.addResponse('registration', logIn);
