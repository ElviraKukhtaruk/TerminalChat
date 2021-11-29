let net                             = require('net');
let format                          = require('./modules/encryptData');
let handshake                       = require('./modules/handshake');
let redis                           = require('./redis/setAndGet');
let timeFormat                      = require('./modules/timeFormat');
const { get } = require('./redis/redis');

let PATH_TO_SERVER_AUTH_PRIVATE_KEY = './server_priv.pem';



let server = net.createServer(socket => {
try{
 handshake.getKeysAndSendPublicKey(socket);

 socket.on('data', getDataFromUser.bind({socket: socket}));

 socket.on('close', socketClose.bind({socket: socket}));

 socket.on('error', err => console.log(`Socket error: ${err}`));
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while sending the public key: ${err}`);
}
});



function getDataFromUser(data){
  if(this.socket.status === 'auth') getDataAfterECDHHandshake(data, this.socket);   
  else handshake.ECDH(this.socket, data, PATH_TO_SERVER_AUTH_PRIVATE_KEY); 
}

 


function getDataAfterECDHHandshake(data, socket){
try{
  let decryptedData = format.get(socket, data);
  console.log(`USER ${timeFormat()}> ${decryptedData}`);
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while retrieving data from client: ${err}`);
}
}

function socketClose(socket){
try{
  redis.delete(this.socket.id);
  console.log('Socket closed');
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occured while closing the socket: ${err}`);
}
}



server.listen(3000, '192.168.0.43');