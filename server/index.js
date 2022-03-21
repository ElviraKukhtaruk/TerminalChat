let net = require('net');
let db = require('./mongodb/mongoose');
let redis = require('./redis/setAndGet');
let handshake = require('./handshake/ECDHHandshake');
let Request = require('./request/Request');
let initRequests = require('./request/initRequests');
let Socket = require('./modules/sockets/Socket');

initRequests();

let server = net.createServer(socket => {
	try {
		handshake.newConnection(socket);

		socket.on('data', getDataFromUser.bind({ socket: socket }));

		socket.on('close', () => Socket.deleteSocket(socket));

		socket.on('error', err => console.log(`Socket error: ${err}`));
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while new connection: ${err}`);
	}
});


function getDataFromUser(data){
 	try {
		// When the socket status is "auth" then the user has finished the ECDH handshake
		if (this.socket.status === 'auth') Request.matchRequestType(this.socket, data);
		else handshake.ECDH(this.socket, data); 
	} catch(err) {
		console.log(`${this.socket.remoteAddress} - ${this.socket.status} - An error occurred while receiving data: ${err}`);
		if (this.socket.status === 'auth') this.socket.error('Error during data validation on the server');
	}
}

process.on('SIGINT', async () => {
	console.log('\nDeleting all chats from redis...');
	let dbSize = await redis.dbSize();
    if(dbSize){ 
		let allChats = await redis.scan(0, '*', `${dbSize}`, 'set');
		// Select only keys (i != 0) - because the first element is the length of the database.
		await Promise.all(allChats.map(async (chat, i) => i != 0 && chat.length ? await redis.delete(chat) : null));
	}
	console.log('All chats have been deleted');
    process.exit();
});


server.listen(3000, '0.0.0.0');
