let file = require('../../../shared/AsyncFileOperations');

module.exports = async (socket, res) => {
	try {
		await file.write(`./token/token`, res.body.token);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}
