let crypto = require('../../shared/cryptographic/crypto');
let transmission = require('../../shared/cryptographic/transmission');
let errorResponse = require('../modules/response/error');
let Socket = require("../modules/sockets/Socket");

module.exports.newConnection = async (socket) => {
	socket.status = 'new_connection';
	socket.id = crypto.generateRandomId();
	socket.send = transmission.encrypt;
	socket.get = transmission.decrypt;
	socket.error = errorResponse;
	Socket.addSocket(socket.id, socket);
	console.log(`\nClient connected: ${socket.remoteAddress}`);
}

module.exports.ECDH = async (socket, data) => {
	try {
		switch(socket.status) {
			case 'new_connection':
				socket.status = 'pub_key_rcvd';
				let privateStaticKey = await crypto.getPrivateStaticKey('./keys/x25519-priv.pem');
				let preMasterSecret = crypto.generateSecret(data, privateStaticKey);
				// Generate ECDH Keys for master secret
				let ECDHKeys = crypto.generateECDHKeys();
				socket.ECDHPrivateKey = ECDHKeys.privateKey, socket.secret = preMasterSecret;
				socket.send(ECDHKeys.publicKey);
				break;
			case 'pub_key_rcvd':
				let publicKey = socket.get(data);
				let masterSecret = crypto.generateSecret(publicKey, socket.ECDHPrivateKey);
				delete socket.ECDHPrivateKey;
				socket.status = 'auth', socket.secret = masterSecret;
				break;
		}
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred during the ECDH handshake: ${err}`);
		socket.destroy();
	}
}
