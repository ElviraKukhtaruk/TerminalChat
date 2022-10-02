let crypto = require('../../shared/cryptographic/crypto');
let transmission = require('../../shared/cryptographic/transmission');
let errorResponse = require('../modules/response/error');
let Socket = require("../modules/sockets/Socket");
let handshakeError = require('./handshakeError');

module.exports.newConnection = async (socket) => {
	socket.status = 'new_connection';
	socket.id = await crypto.generateRandomId(16, 'hex');
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
				console.log(`~ ${socket.remoteAddress} Generation of pre-master secret...`);
				let privateStaticKey = await crypto.getPrivateStaticKey('./keys/x25519-priv.pem');
				let preMasterSecret = crypto.generateSecret(data, privateStaticKey);
				// Generate ECDH Keys for master secret
				let ECDHKeys = crypto.generateECDHKeys();
				socket.ECDHPrivateKey = ECDHKeys.privateKey, socket.secret = preMasterSecret, socket.status = 'pub_key_rcvd';
				socket.send(ECDHKeys.publicKey);
				break;
			case 'pub_key_rcvd':
				console.log(`~ ${socket.remoteAddress} Generation of master secret...`);
				let publicKey = socket.get(data);
				let masterSecret = crypto.generateSecret(publicKey, socket.ECDHPrivateKey);
				delete socket.ECDHPrivateKey;
				socket.status = 'auth', socket.secret = masterSecret;
				socket.send({endHandshake: true});
				break;
		}
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred during the ECDH handshake: ${err}`);
		handshakeError(socket);
	}
}
