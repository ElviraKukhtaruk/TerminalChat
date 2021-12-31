let net       = require('net');
let db        = require('./mongodb/mongoose');
let handshake = require('./ECDHHandshake/handshake');
let Request   = require('./modules/requests/Request');
let chats     = require('./modules/requests/chats');
let log_in    = require('./modules/requests/log_in');


chats();
log_in();

let server = net.createServer(socket => {
	try {
      handshake.newConnection(socket);

      socket.on('data', getDataFromUser.bind({ socket: socket }));

      socket.on('close', () => console.log('Socket closed'));

      socket.on('error', err => console.log(`Socket error: ${err}`));
	} catch(err) {
	   console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while sending the public key: ${err}`);
   }
});


function getDataFromUser(data){
   // When the socket status is "auth" then the user has finished the ECDH handshake
 	if (this.socket.status === 'auth') Request.matchRequestType(this.socket, data);
   else handshake.ECDH(this.socket, data); 
}


server.listen(3000, '0.0.0.0');
