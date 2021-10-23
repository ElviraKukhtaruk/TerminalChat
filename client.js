let net    = require('net');
let crypto = require('./encryption');

let PATH_TO_CLIENT_AUTH_PRIVATE_KEY = './client_priv.pem';
let PATH_TO_SERVER_AUTH_PUB_KEY     = './pub.pem';
let currentUserData                 = '';


module.exports = (host, port)=>{
  
let client = new net.Socket();


client.connect(port, host, function(){
 console.log(`Connected to host: ${host}, port: ${port}`);
 client.status = 'new_connect';
 let myECDHKeys = crypto.generateECDHKeys();
 console.log('Sending public key '+new Date().getMilliseconds());
 client.write(myECDHKeys.publicKey);

 client.on('data', async function(data){
  switch(client.status){
    case 'new_connect':
      client.status = 'pub_key_rcvd';
      let signature = await crypto.createSignature(data, PATH_TO_CLIENT_AUTH_PRIVATE_KEY);
      client.pubKey = data;
      client.write(signature);
      break;
    case 'pub_key_rcvd':
      let verifySignature = await crypto.verifySignature(myECDHKeys.publicKey, PATH_TO_SERVER_AUTH_PUB_KEY, data);
      console.log(`Signature verification result: ${verifySignature}`);
      let secret = crypto.generateSecret(verifySignature, client.pubKey, myECDHKeys.privateKey);
      if(secret){
        client.secret = secret;
        client.status = 'auth';
      }else{
        client.destroy();
      } 
      break;
    case 'auth':
      let d = new Date();
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      let dataObject = JSON.parse(data),
          authTag    = Buffer.from(dataObject.authTag),
          iv         = Buffer.from(dataObject.iv);
      let decryptedText = crypto.decryptData(dataObject.data, client.secret, authTag, iv);
      console.log(`USER ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}> ${decryptedText}`);
      process.stdout.write(currentUserData);
      break;
 }
});
});


let stdin = process.openStdin();
    stdin.setRawMode(true);
    stdin.setEncoding('utf-8');
 
    stdin.addListener('data', function(data){
     if(data === '\u0003') process.exit(); // Ctrl+c
     else if(data.charCodeAt(0) === 127){ // Backspace
        currentUserData = currentUserData.slice(0, -1); // Remove last character from a string
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(currentUserData);
     }else if(data === '\u000d'){ // Enter
        process.stdout.write('\n');
        let encrypt = crypto.encryptData(currentUserData, client.secret);
        client.write(JSON.stringify(encrypt));
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        currentUserData = '';
      }else{
        currentUserData += data;
        process.stdout.write(data);
      }
    });



client.on('close', function(){
    console.log('Connection closed');
});
}


























/*
let net = require('net');
let currentUserData = '';


let server = net.createServer(function(socket){

 let stdin = process.openStdin();
     stdin.setRawMode(true);
     stdin.setEncoding('utf-8');

 let listener = stdin.addListener('data', function(data){
  if(data === '\u0003') process.exit(); // Ctrl+c
  else if(data.charCodeAt(0) === 127){ // Backspace
      currentUserData = currentUserData.slice(0, -1); // Remove last character from a string
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(currentUserData);
  }else if(data === '\u000d'){ // Enter
    process.stdout.write(data+'\n');
    socket.write(currentUserData);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    currentUserData = '';
  }
  else if(data === '\u001b[A'){ process.stdout.write('[A'); }
  else if(data === '\u001b[B'){ process.stdout.write('[B'); }
  else if(data === '\u001b[C'){ process.stdout.write('[C'); }
  else if(data === '\u001b[D'){ process.stdout.write('[D'); }
  else{
    currentUserData += data;
    process.stdout.write(data);
  }
 });
    
    
 socket.on('data', function(data){
    let d = new Date();
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(`USER ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}> ${data.toString()}`);
    process.stdout.write(currentUserData);
 });

 socket.on('close',  function(){
    listener.removeAllListeners();
    console.log('Socket closed');
 });
});



server.listen(3000, '192.168.0.43');

*/

