let format = require('../modules/encryptData');


module.exports = (data, socket) =>{
try{
  let date = new Date();
  let decryptedData = format.get(socket, data);
  console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${decryptedData}`);
  for(let i = 0; i < sockets.length; i++){
    if(sockets[i].id !== socket.id) sockets[i].write(format.set(sockets[i], decryptedData));
  }
}catch(err){
  console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while retrieving data from client: ${err}`);
}
}