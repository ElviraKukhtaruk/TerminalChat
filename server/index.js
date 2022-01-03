let net          = require('net');
let db           = require('./mongodb/mongoose');
let handshake    = require('./ECDHHandshake/handshake');
let Request      = require('./requests/Request');
let initRequests = require('./modules/request/initRequests');

initRequests();

let server = net.createServer(socket => {
	try {
      handshake.newConnection(socket);

      socket.on('data', getDataFromUser.bind({ socket: socket }));

      socket.on('close', () => console.log('Socket closed'));

      socket.on('error', err => console.log(`Socket error: ${err}`));
	} catch(err) {
	   console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while new connection: ${err}`);
   }
});


function getDataFromUser(data){
   try {
      // When the socket status is "auth" then the user has finished the ECDH handshake
 	   if (this.socket.status === 'auth' || this.socket.status === 'full_auth') Request.matchRequestType(this.socket, data);
      else handshake.ECDH(this.socket, data); 
   } catch(err) {
      console.log(`${this.socket.remoteAddress} - ${this.socket.status} - An error occurred while receiving data: ${err}`);
      if(this.socket.status === 'auth' || this.socket.status === 'full_auth') this.socket.error('Error during data validation on the server');
   }
}


server.listen(3000, '0.0.0.0');
