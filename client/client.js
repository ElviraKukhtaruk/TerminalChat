let handshake          = require('./ECDHHanshake/handshake');
let Request            = require('./responses/Request');
let getDataFromConsole = require('./modules/userData/getDataFromConsole');
let initResponses      = require('./modules/response/initResponses');
let client;

initResponses();

async function connection() {
	try {
  	   client = this.client;

   	   await handshake.newConnection(client);

	   getDataFromConsole(client);

  	   client.on('data', receiveDataFromServer);
		 
  	   client.on('close', () => console.log('Connection closed'));
	} catch(err) {
  	   console.log(`An error occurred while connecting: ${err}`);
	}
}


function receiveDataFromServer(data) {
	try {
		// When the socket status is "auth" then the user has finished the ECDH handshake
    	if(client.status === 'auth') Request.matchRequestType(client, data);
    	else handshake.ECDH(client, data);
	} catch(err) {
		console.log(`${socket.status} - An error occurred while receiving data: ${err}`);
	}
}
    
module.exports = connection;
