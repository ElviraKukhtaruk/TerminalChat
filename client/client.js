let handshake = require('./handshake/ECDHHandshake');
let Response = require('./response/Response');
const figlet = require('figlet');
// Init Responses
require('./response/initResponses');


async function connection() {
	try {

		figlet.text('TERMINAL CHAT', {
  			font: 'Big', 
  			horizontalLayout: 'default',
  			verticalLayout: 'default',

		}, function(err, data) {
  			console.log(data);
		});

		let client = this.client;

		await handshake.newConnection(client, this.serverPublicKey);

		client.on('data', Response.checkClientStatus.bind({client, Response}));
		 
		client.on('close', () => console.log('Connection closed'));
	} catch(err) {
		console.log(`An error occurred while connecting: ${err}`);
	}
}
    
module.exports = connection;
