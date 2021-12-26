let handshake          = require('./modules/handshake');
let Request            = require('./modules/requests/Request');
let requests           = require('./modules/requests/chats'); 
let getDataFromConsole = require('./modules/getDataFromConsole');
let client;

requests.chats();


async function connection() {
	try {
  	   client = this.client;
       
	   getDataFromConsole(client);

   	   await handshake.newConnection(client);

  	   client.on('data', receiveDataFromServer);
		 
  	   client.on('close', () => console.log('Connection closed'));
	} catch(err) {
  	   console.log('An error occurred while connecting');
	}
}


function receiveDataFromServer(data) {
    if(client.status === 'auth') Request.matchRequestType(client, data);
    else handshake.ECDH(client, data);
}
    
module.exports = connection;
