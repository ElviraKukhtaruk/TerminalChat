let timeFormat = require('../../../shared/timeFormat');

module.exports = (socket, res) => {
	try {
		console.log(`USER ${timeFormat()}> ${res.body.message}`);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}
