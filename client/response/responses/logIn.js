let file = require('../../../shared/AsyncFileOperations');

module.exports = async (client, res) => {
	try {
		if(res.body.token) await file.write(`./token/token`, res.body.token);
		client.send({header: {type: 'myChats'}, body: {} });
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}
