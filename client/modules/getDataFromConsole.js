let currentUserData = '';
let client;
let mode;

let stdin = process.openStdin();
    stdin.setRawMode(true);
    stdin.setEncoding('utf-8');

function getDataFromConsole(data){
    try{
 	   // Ctrl+c
 	   if(data === '\u0003') process.exit();
 	   // Backspace
 	   else if(data.charCodeAt(0) === 127) { 
       // Remove last character from string
   	   currentUserData = currentUserData.slice(0, -1); 
   	   process.stdout.clearLine();
   	   process.stdout.cursorTo(0);
   	   process.stdout.write(currentUserData);
 	   // Enter
 	   } else if(data === '\u000d') {
   	      process.stdout.write('\n');
   	      client.send(JSON.stringify({header: { type: 'message' }, body: { message: currentUserData } }));
   	      process.stdout.clearLine();
   	      process.stdout.cursorTo(0);
   	      currentUserData = '';
 	   } else if(data.charCodeAt(0) === 1) mode = 'registration';
		 else {
   	      currentUserData += data;
   	      process.stdout.write(data);
 	   }
	} catch(err) {
  	   console.log('An error occurred while processing the entered data or sending data');
	}
}

module.exports = this_client => client = this_client, stdin.addListener('data', getDataFromConsole);
