let net                             = require('net');
let sendingFormat                   = require('./sendingFormat');
let gettingFormat                   = require('./gettingFormat');
let handshake                       = require('./handshake');

let PATH_TO_SERVER_AUTH_PRIVATE_KEY = './serverPriv.pem';
let sockets                         = [];
let currentUserData                 = '';


let server = net.createServer(socket => {
 
 handshake.sendPublicKey(socket);

 socket.on('data', getDataFromUser.bind({socket: socket}));

 

 socket.on('close',  () => {
    // Remove socket from array 
    sockets = sockets.filter(socket_obj => socket_obj.id !== socket.id); 
    console.log('Socket closed');
 });
});



function getDataFromUser(data){
  let socket = this.socket;
  if(socket.status === 'auth') getDataAfterECDHHandshake(data, socket);   
  else handshake.ECDH(socket, data, PATH_TO_SERVER_AUTH_PRIVATE_KEY, sockets); 
}


function getDataAfterECDHHandshake(data, socket){
  let date = new Date();
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  let decryptedData = gettingFormat(socket, data);
  console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${decryptedData}`);
  for(let i = 0; i < sockets.length; i++){
    if(sockets[i].id !== socket.id) sockets[i].write(sendingFormat(sockets[i], decryptedData));
  }
  process.stdout.write(currentUserData);
}



server.listen(3000, '192.168.0.43');