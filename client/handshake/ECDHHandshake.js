let crypto = require('../../shared/cryptographic/crypto');
let file = require('../../shared/AsyncFileOperations');
let shared_transmission = require('../../shared/cryptographic/transmission');
let client_transmission = require('../modules/cryptographic/transmission');
let login = require('../modules/auth/logIn');

module.exports.newConnection = async (client, publicServerKeyPath) => {
	// Generate ECDH Keys for pre-master secret
	let staticECDHKeys = crypto.generateECDHKeys();
	client.write(staticECDHKeys.publicKey);
	let publicServerKey = await file.read(publicServerKeyPath);
	let preMasterSecret = crypto.generateSecret(publicServerKey, staticECDHKeys.privateKey);
	client.secret = preMasterSecret;
	client.send = client_transmission.encrypt;
	client.get = shared_transmission.decrypt;	
}


module.exports.ECDH = async (client, data) => {
	try {
		let serverPublicECDHKey = client.get(data);
		// Generate ECDH Keys for master secret
		let ECDHKeys = crypto.generateECDHKeys();
		let masterSecret = crypto.generateSecret(serverPublicECDHKey, ECDHKeys.privateKey);
		client.send(ECDHKeys.publicKey);
		client.secret = masterSecret, client.status = 'auth';
		await login(client);
	} catch(err) {
		console.log(err);
		//console.log(`An error occurred during the ECDH handshake: ${err}`);
 	}
}
