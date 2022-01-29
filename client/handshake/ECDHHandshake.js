let crypto       = require('../../shared/cryptographic/crypto');
let file         = require('../../shared/AsyncFileOperations');
let transmission = require('../../shared/cryptographic/transmission');
let log_in       = require('../modules/auth/logIn/logIn');

module.exports.newConnection = async (client, publicServerKeyPath) => {
	// Generate ECDH Keys for pre-master secret
	let staticECDHKeys = crypto.generateECDHKeys();
	client.write(staticECDHKeys.publicKey);
	let publicServerKey = await file.read(publicServerKeyPath);
	let preMasterSecret = crypto.generateSecret(publicServerKey, staticECDHKeys.privateKey);
	client.secret = preMasterSecret;
	client.send = transmission.encrypt;
	client.get = transmission.decrypt;
}



module.exports.ECDH = async (client, data) => {
	try {
		let serverPublicECDHKey = client.get(data);
		// Generate ECDH Keys for master secret
		let ECDHKeys = crypto.generateECDHKeys();
		let masterSecret = crypto.generateSecret(serverPublicECDHKey, ECDHKeys.privateKey);
		client.send(ECDHKeys.publicKey);
		client.secret = masterSecret, client.status = 'auth';
		await log_in(client);
	} catch(err) {
		console.log(`An error occurred during the ECDH handshake: ${err}`);
 	}
}
