let crypto        = require('./encryption');
let encryptData = require('./encryptData');

module.exports.getKeysAndSendPublicKey = (client)=>{
    let myECDHKeys = crypto.generateECDHKeys();
    console.log('2) Sending public key...');
    client.write(myECDHKeys.publicKey);
    console.log('- Public key was sent ✅');
    return myECDHKeys;
}


module.exports.ECDH = async (client, data, myECDHKeys, SERVER_PUB_KEY) => {
try{
    switch(client.status){
        case 'new_connect':
          client.status = 'pub_key_rcvd', client.pubKey = data;
          break;
        case 'pub_key_rcvd':
          let verifySignature = await crypto.verifySignature(myECDHKeys.publicKey, SERVER_PUB_KEY, data);
          let secret = crypto.generateSecret(verifySignature, client.pubKey, myECDHKeys.privateKey);
          if(secret) client.secret = secret, client.status = 'auth';
          else client.destroy();
          console.log('5) Sending test ciphertext...');
          client.write(encryptData.set(client, 'test'));
          console.log('- Test ciphertext sent ✅\n');
          break;
      }
}catch(err){
  console.log('An error occurred during the ECDH handshake');
}
}







/*
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
try{
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
}catch(err){
  console.log('An error has occurred: '+err);
}
}

*/