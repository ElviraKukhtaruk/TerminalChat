let net = require('net');
let event;
let currentUserData = '';


module.exports = (host, port)=>{
  
let client = new net.Socket();


client.connect(port, host, function(){
 console.log(`Connected to host: ${host}, port: ${port}`);
 
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
});

client.on('data', function(data){
   let d = new Date();
   process.stdout.clearLine();
   process.stdout.cursorTo(0);
   console.log(`USER ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}> ${data.toString()}`);
   process.stdout.write(currentUserData);
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

