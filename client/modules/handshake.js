let crypto        = require('./encryption');
let sendingFormat = require('./sendingFormat');

module.exports.getKeysAndSendPublicKey = (client)=>{
    let myECDHKeys = crypto.generateECDHKeys();
    console.log('Sending public key...');
    client.write(myECDHKeys.publicKey);
    console.log('Public was sent');
    return myECDHKeys;
}


module.exports.ECDH = async (client, data, myECDHKeys, SERVER_PUB_KEY) => {
    switch(client.status){
        case 'new_connect':
          client.status = 'pub_key_rcvd', client.pubKey = data;
          break;
        case 'pub_key_rcvd':
          let verifySignature = await crypto.verifySignature(myECDHKeys.publicKey, SERVER_PUB_KEY, data);
          let secret = crypto.generateSecret(verifySignature, client.pubKey, myECDHKeys.privateKey);
          if(secret) client.secret = secret, client.status = 'auth';
          else client.destroy();
          console.log('Sending test ciphertext...');
          client.write(sendingFormat(client, 'test'));
          console.log('Test ciphertext sent');
          break;
      }
}