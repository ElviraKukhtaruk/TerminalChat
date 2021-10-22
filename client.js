let net    = require('net');
let crypto = require('./encryption');

let currentUserData = '';


module.exports = (host, port)=>{
  
let client = new net.Socket();


client.connect(port, host, function(){
 console.log(`Connected to host: ${host}, port: ${port}`);
 client.status = 'new_connect';
 let myECDHKeys = crypto.generateECDHKeys();
 console.log('Sending public key');
 client.write(myECDHKeys.publicKey);

 client.on('data', async function(data){
  switch(client.status){
    case 'new_connect':
      let signature = await crypto.createSignature(data, './client_priv.pem');
      client.status = 'pub_key_rcvd';
      client.write(signature);
      break;
    case 'pub_key_rcvd':
      let verifySignature = await crypto.verifySignature(myECDHKeys.publicKey, './pub.pem', data);
      console.log(`Signature verification result: ${verifySignature}`);
 }

   //let d = new Date();
   //process.stdout.clearLine();
   //process.stdout.cursorTo(0);
   //console.log(`USER ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}> ${data.toString()}`);
   //process.stdout.write(currentUserData);
});
 
});



client.on('close', function(){
    console.log('Connection closed');
});
}




/*
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
        client.write(currentUserData);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        currentUserData = '';
        
      }
      else if(data === '\u001b[A'){ process.stdout.write('^[A'); }
      else if(data === '\u001b[B'){ process.stdout.write('^[B'); }
      else if(data === '\u001b[C'){ process.stdout.write('^[C'); }
      else if(data === '\u001b[D'){ process.stdout.write('^[D'); }
      else{
        currentUserData += data;
        process.stdout.write(data);
      }
    });
*/
























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

