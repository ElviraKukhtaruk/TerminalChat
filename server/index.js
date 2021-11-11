let net                             = require('net');
let encryptData                     = require('./encryptData');
let handshake                       = require('./handshake');

let PATH_TO_SERVER_AUTH_PRIVATE_KEY = './server_priv.pem';
let sockets                         = [];


let server = net.createServer(socket => {
try{
 handshake.sendPublicKey(socket);

 socket.on('data', getDataFromUser.bind({socket: socket}));

 socket.on('close', socketClose);

 socket.on('error', err => console.log(`Socket error: ${err}`));
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while sending the public key: ${err}`);
}
});



function getDataFromUser(data){
  let socket = this.socket;
  if(socket.status === 'auth') getDataAfterECDHHandshake(data, socket);   
  else handshake.ECDH(socket, data, PATH_TO_SERVER_AUTH_PRIVATE_KEY, sockets); 
}

 


function getDataAfterECDHHandshake(data, socket){
try{
  let date = new Date();
  let decryptedData = encryptData.get(socket, data);
  console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${decryptedData}`);
  for(let i = 0; i < sockets.length; i++){
    if(sockets[i].id !== socket.id) sockets[i].write(encryptData.set(sockets[i], decryptedData));
  }
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while retrieving data from client: ${err}`);
}
}

function socketClose(socket){
try{
  sockets = sockets.filter(socket_obj => socket_obj.id !== socket.id); 
  console.log('Socket closed');
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occured while closing the socket: ${err}`);
}
}



server.listen(3000, '192.168.0.43');