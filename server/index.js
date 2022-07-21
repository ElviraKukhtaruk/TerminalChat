let net = require('net');
let db = require('./postgresql/postgresql');
let clearRedis = require('./redis/clear');
let handshake = require('./handshake/ECDHHandshake');
let Request = require('./request/Request');
let handshakeTimeout = require('./handshake/handshakeTimeout');


// Init Requests
require('./request/initRequests');

async function server(){
	await db.init();
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
	server.listen(3000, '0.0.0.0');
}


process.on('SIGINT', clearRedis);

server();