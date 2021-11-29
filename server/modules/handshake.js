let crypto             = require('./encryption');
let generate_random_id = require('./id_generation');
let format             = require('./encryptData');
let redis              = require('../redis/setAndGet');

module.exports.getKeysAndSendPublicKey = (socket)=>{
  socket.status = 'new_connection';
  console.log(`\nClient connected: ${socket.remoteAddress}`);
  let myECDHKeys = crypto.generateECDHKeys();
  console.log('~ Sending public key...');
  socket.write(myECDHKeys.publicKey);
  console.log('~ Public key was sent ✅');
  socket.id = generate_random_id();
  socket.myPubKey  = myECDHKeys.publicKey;
  socket.myPrivKey = myECDHKeys.privateKey;
}


module.exports.ECDH = async (socket, data, SERVER_PRIV_KEY, sockets) => {
try{
    switch(socket.status){
        case 'new_connection':
           socket.status = 'pub_key_rcvd', socket.pubKey = data;
           let signature = await crypto.createSignature(data, SERVER_PRIV_KEY);
           socket.write(signature);
           let secret = crypto.generateSecret(socket.pubKey, socket.myPrivKey);
           if(secret) socket.secret = secret;
           else socket.destroy(); 
           break;
        case 'pub_key_rcvd':
           console.log('~ Test cipthertext recieved...');
           if(format.get(socket, data) === 'test'){
             socket.status = 'auth';
            // sockets.push(socket);
             await redis.set(socket.id, {socket}, true);
             console.log('~ Decryption of the text was successful ✅');
             socket.write(await crypto.createSignature('test', SERVER_PRIV_KEY));
             console.log('~ Confirmation sent ✅');
           }else{
            console.log('~ Decryption of the text was unsuccessful ✖\n'); 
            socket.destroy();
           }
           break;
     }
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred during the ECDH handshake: ${err}`);
}
}







/*

let crypto             = require('./encryption');
let generate_random_id = require('./id_generation');
let gettingFormat      = require('./gettingFormat');

module.exports.sendPublicKey = (socket)=>{
  socket.status = 'new_connect';
  let myECDHKeys = crypto.generateECDHKeys();
  socket.write(myECDHKeys.publicKey);
  socket.id = generate_random_id();
  socket.myPubKey  = myECDHKeys.publicKey;
  socket.myPrivKey = myECDHKeys.privateKey;
}


module.exports.ECDH = async (socket, data, SERVER_PRIV_KEY, sockets) => {
try{
    switch(socket.status){
        case 'new_connect':
           socket.status = 'pub_key_rcvd', socket.pubKey = data;
           let signature = await crypto.createSignature(data, SERVER_PRIV_KEY);
           socket.write(signature);
           let secret = crypto.generateSecret(socket.pubKey, socket.myPrivKey);
           if(secret) socket.secret = secret;
           else socket.destroy(); 
           break;
         case 'pub_key_rcvd':
           console.log('Test cipthertext recieved');
           if(gettingFormat(socket, data) === 'test'){
             socket.status = 'auth';
             sockets.push(socket); 
             console.log('Test cipthertext success');
           }else socket.destroy();
           break;
     }
}catch(err){
  socket.write(JSON.stringify({err: 'There was a problem with the ECDH handshake'}));
  console.log('An error has occurred: '+err);
}
}


 */