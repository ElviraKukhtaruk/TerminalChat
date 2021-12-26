let crypto             = require('./encryption');
let generate_random_id = require('./id_generation');
let transmission       = require('./transmission');

module.exports.newConnection = (socket) => {
   socket.status = 'new_connection';
   socket.id = generate_random_id();
   socket.send = transmission.encrypt;
   socket.get = transmission.decrypt;
	console.log(`\nClient connected: ${socket.remoteAddress}`);
}

module.exports.ECDH = async (socket, data) => {
   try {
    	switch(socket.status) {
         case 'new_connection':
            socket.status = 'pub_key_rcvd';
            let privateStaticKey = await crypto.getPrivateStaticKey('./x25519-priv.pem');
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
