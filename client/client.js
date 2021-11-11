let encryptData   = require('./modules/encryptData');
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
  console.log('An error occurred while sending the public key');
}
}

let stdin = process.openStdin();
    stdin.setRawMode(true);
    stdin.setEncoding('utf-8');
    stdin.addListener('data', getDataFromConsole);


function receiveDataFromServer(data){
    if(client.status === 'auth') getDataAfterECDHHandshake(data);
    else handshake.ECDH(client, data, myECDHKeys, SERVER_PUB_KEY);
}


function getDataAfterECDHHandshake(data){
try{
    let date = new Date();
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(`USER ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}> ${encryptData.get(client, data)}`);
    process.stdout.write(currentUserData);
}catch(err){
  console.log('An error occurred while retrieving data from server');
}
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
   client.write(encryptData.set(client, currentUserData));
   process.stdout.clearLine();
   process.stdout.cursorTo(0);
   currentUserData = '';
 }else{
   currentUserData += data;
   process.stdout.write(data);
 }
}catch(err){
  console.log('An error occurred while processing the entered data or sending data');
}
}
    
module.exports = connection;