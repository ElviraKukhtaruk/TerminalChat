let net                = require('net');
let tls                = require('tls')
let fs                 = require('fs')
let generate_random_id = require('./id_generation');
let get_socket_by_id   = require('./get_socket_by_id');


let sockets            = [];


let server = net.createServer(socket => {
  socket.id = generate_random_id();
  sockets.push(socket);
    
 socket.on('data', data => {
    let date = new Date();
    console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${data.toString()}`);
    for(let i = 0; i < sockets.length; i++){
      if(sockets[i].id !== socket.id) sockets[i].write(data); // Send a message to everyone except the sender
    }
 });

 socket.on('close',  () => {
    sockets = sockets.filter(socket_obj => socket_obj.id !== socket.id); // Remove socket from array 
    console.log('Socket closed');
 });
});


server.listen(3000, '192.168.0.43');
//socket.destroy();




var options = {
  key: fs.readFileSync('./certs/chat.key'),
  cert: fs.readFileSync('./certs/chat.crt')
};






























/*

let crypto = require('crypto');


let myKeys = crypto.createECDH('secp256k1');
    myKeys.generateKeys();


let otherKeys =  crypto.createECDH('secp256k1');
    otherKeys.generateKeys();

let myPublicKey = myKeys.getPublicKey().toString('base64');
let otherPublicKey = otherKeys.getPublicKey().toString('base64');


let mySecret = myKeys.computeSecret(otherPublicKey, 'base64', 'hex');
let otherSecret = otherKeys.computeSecret(myPublicKey, 'base64', 'hex');

let myIV = crypto.randomBytes(16);
let cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(mySecret, 'hex'), myIV);


let otherIV = crypto.randomBytes(16).toString('hex').slice(0, 32);
//let otherCipher = crypto.createCipheriv('aes-256-ctr', otherSecret, otherIV);

console.log(mySecret);
console.log(otherSecret);
*/


