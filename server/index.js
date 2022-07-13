let net = require('net');
let db = require('./mongodb/mongoose');
let redis = require('./redis/setAndGet');
let handshake = require('./handshake/ECDHHandshake');
let Request = require('./request/Request');
let handshakeTimeout = require('./handshake/handshakeTimeout');

// Init Requests
require('./request/initRequests');

let server = net.createServer(socket => {
	try {
		handshake.newConnection(socket);

		handshakeTimeout.set(socket);

		socket.on('data', Request.checkUserStatus.bind({socket, Request}));

		socket.on('close', () => handshakeTimeout.clear(socket));

		socket.on('error', err => console.log(`Socket error: ${err}`));
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while new connection: ${err}`);
	}
});


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