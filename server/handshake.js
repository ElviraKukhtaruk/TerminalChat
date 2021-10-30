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
}