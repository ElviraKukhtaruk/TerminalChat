let net                = require('net');
let fs                 = require('fs');
let crypto             = require('./encryption');
let generate_random_id = require('./id_generation');


let PATH_TO_CLIENT_AUTH_PUB_KEY     = './client_pub.pem';
let PATH_TO_SERVER_AUTH_PRIVATE_KEY = './priv.pem';
let sockets                         = [];
let currentUserData                 = '';


let stdin = process.openStdin();
    stdin.setRawMode(true);
    stdin.setEncoding('utf-8');

let server = net.createServer(socket => {
  socket.id = generate_random_id();
  socket.status = 'new_connect';
  let myECDHKeys = crypto.generateECDHKeys();
  console.log('Sending public key');
  socket.write(myECDHKeys.publicKey);
  socket.myPubKey  = myECDHKeys.publicKey;
  socket.myPrivKey = myECDHKeys.privateKey;

 socket.on('data', async (data) => {
  switch(socket.status){
     case 'new_connect':
        socket.status = 'pub_key_rcvd';
        let signature = await crypto.createSignature(data, PATH_TO_SERVER_AUTH_PRIVATE_KEY);
        socket.pubKey = data;
        socket.write(signature);
        break;
      case 'pub_key_rcvd':
        let verifySignature = await crypto.verifySignature(socket.myPubKey, PATH_TO_CLIENT_AUTH_PUB_KEY, data);
        console.log(`Signature verification result: ${verifySignature}`);
        let secret = crypto.generateSecret(verifySignature, socket.pubKey, socket.myPrivKey);
        if(secret){ 
          socket.secret = secret;
          socket.status = 'auth';
          sockets.push(socket);
        }else socket.destroy(); 
        break;
      case 'auth':
        let date = new Date();
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        let dataObject = JSON.parse(data),
            authTag    = Buffer.from(dataObject.authTag),
            iv         = Buffer.from(dataObject.iv);
        let decryptedText = crypto.decryptData(dataObject.data, socket.secret, authTag, iv);
        console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${decryptedText}`);
        process.stdout.write(currentUserData);
        break;
  }
 
 });

 

 socket.on('close',  () => {
    sockets = sockets.filter(socket_obj => socket_obj.id !== socket.id); // Remove socket from array 
    console.log('Socket closed');
 });
});


stdin.addListener('data', function(data){
  if(sockets[0].status === 'auth'){
   if(data === '\u0003') process.exit(); // Ctrl+c
   else if(data.charCodeAt(0) === 127){ // Backspace
    currentUserData = currentUserData.slice(0, -1); // Remove last character from a string
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(currentUserData);
   }else if(data === '\u000d'){ // Enter
    process.stdout.write('\n');
    for(let i = 0; i < sockets.length; i++){
      sockets[i].write(JSON.stringify(crypto.encryptData(currentUserData, sockets[i].secret)));
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    currentUserData = '';
    }else{
      currentUserData += data;
      process.stdout.write(data);
    }
  }
});


server.listen(3000, '192.168.0.43');
//socket.destroy();



 







/*
socket.on('data', data => {
    let date = new Date();
    console.log(`USER ${date.getHours()}:${date.getMinutes()}> ${data.toString()}`);
    for(let i = 0; i < sockets.length; i++){
      if(sockets[i].id !== socket.id) sockets[i].write(data); // Send a message to everyone except the sender
    }
 });
*/
























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


