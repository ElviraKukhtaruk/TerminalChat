let crypto       = require('./encryption');
let transmission = require('./transmission');

module.exports.newConnection = async (client) => {
    // Generate ECDH Keys for pre-master secret
    let staticECDHKeys = crypto.generateECDHKeys();
    client.write(staticECDHKeys.publicKey);
    let publicServerKey = await crypto.getStaticKey('./x25519-pub.pem');
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
	} catch(err) {
  	   console.log('An error occurred during the ECDH handshake '+ err);
 	}
}
