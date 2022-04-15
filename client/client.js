let handshake = require('./handshake/ECDHHandshake');
let Response = require('./response/Response');
let client;

// Init Responses
require('./response/initResponses');

async function connection() {
	try {
		client = this.client;

		await handshake.newConnection(client, this.serverPublicKey);

		client.on('data', receiveDataFromServer);
		 
		client.on('close', () => console.log('Connection closed'));
	} catch(err) {
		console.log(`An error occurred while connecting: ${err}`);
	}
}


function receiveDataFromServer(data) {
	try {
		// When the socket status is "auth" then the user has finished the ECDH handshake
		if(client.status === 'auth') Response.matchResponseType(client, data);
		else handshake.ECDH(client, data);
	} catch(err) {
		console.log(`${client.status} - An error occurred while receiving data: ${err}`);
	}
}
    
module.exports = connection;
