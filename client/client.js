let handshake          = require('./ECDHHanshake/handshake');
let Request            = require('./modules/requests/Request');
let chats              = require('./modules/requests/chats'); 
let token              = require('./modules/requests/token');
let getDataFromConsole = require('./modules/userData/getDataFromConsole');
let client;


token();
chats();


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
	// When the socket status is "auth" then the user has finished the ECDH handshake
    if(client.status === 'auth') Request.matchRequestType(client, data);
    else handshake.ECDH(client, data);
}
    
module.exports = connection;
