let crypto = require('./encryption');
let format = require('./encryptData');

module.exports.getKeysAndSendPublicKey = (client)=>{
    client.status = 'new_connection';
    let myECDHKeys = crypto.generateECDHKeys();
    console.log('~ Sending public key...');
    client.write(myECDHKeys.publicKey);
    console.log('~ Public key was sent ✅');
    return myECDHKeys;
}


module.exports.ECDH = async (client, data, myECDHKeys, SERVER_PUB_KEY) => {
try{
    switch(client.status){
        case 'new_connection':
          client.status = 'pub_key_rcvd', client.pubKey = data;
          break;
        case 'pub_key_rcvd':
          let verifySignature = await crypto.verifySignature(myECDHKeys.publicKey, SERVER_PUB_KEY, data);
          let secret = crypto.generateSecret(verifySignature, client.pubKey, myECDHKeys.privateKey);
          if(secret){ 
            client.secret = secret;
            console.log('~ Sending test ciphertext...');
            client.write(format.set(client, 'test'));
            console.log('~ Test ciphertext sent ✅');
            client.status = 'ciphertext_sent';
          }else client.destroy();
          break;
        case 'ciphertext_sent':
          console.log('~ Confirmation received...');
          let verifySignatureTest = await crypto.verifySignature('test', SERVER_PUB_KEY, data);
          if(verifySignatureTest) client.status = 'auth';
          else client.destroy();
      }
}catch(err){
  console.log('An error occurred during the ECDH handshake');
}
}