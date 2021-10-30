let sendingFormat   = require('./modules/sendingFormat');
let gettingFormat   = require('./modules/gettingFormat');
let handshake       = require('./modules/handshake');

let SERVER_PUB_KEY  = '';
let currentUserData = '';
let client;
let myECDHKeys;


function connection(){
try{
  client = this.client, client.status = 'new_connect', SERVER_PUB_KEY = this.serverPublicKey;
  myECDHKeys = handshake.getKeysAndSendPublicKey(client);

  client.on('data', receiveDataFromServer);
  client.on('close', () => console.log('Connection closed'));
}catch(err){
  console.log('An error has occurred: '+err);
}
}

let stdin = process.openStdin();
    stdin.setRawMode(true);
    stdin.setEncoding('utf-8');
    stdin.addListener('data', getDataFromConsole);


function receiveDataFromServer(data){
try{
  handshake.ECDH(client, data, myECDHKeys, SERVER_PUB_KEY);
  if(client.status === 'auth') getDataAfterECDHHandshake(data);
}catch(err){
  console.log('An error has occurred: '+err);
}
}


function getDataAfterECDHHandshake(data){
    let date = new Date();
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(`USER ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}> ${gettingFormat(client, data)}`);
    process.stdout.write(currentUserData);
}


function getDataFromConsole(data){
try{
 // Ctrl+c
 if(data === '\u0003') process.exit();
 // Backspace
 else if(data.charCodeAt(0) === 127){ 
   // Remove last character from string
   currentUserData = currentUserData.slice(0, -1); 
   process.stdout.clearLine();
   process.stdout.cursorTo(0);
   process.stdout.write(currentUserData);
 // Enter
 }else if(data === '\u000d'){
   process.stdout.write('\n');
   client.write(sendingFormat(client, currentUserData));
   process.stdout.clearLine();
   process.stdout.cursorTo(0);
   currentUserData = '';
 }else{
   currentUserData += data;
   process.stdout.write(data);
 }
}catch(err){
  console.log('An error has occurred: '+err);
}
}
    
module.exports = connection;