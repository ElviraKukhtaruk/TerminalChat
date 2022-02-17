let actions = require('./actions');
let currentUserData = '', client;

function getDataFromConsole(data){
	try{
		// Ctrl+c
		if(data === '\u0003') process.exit();
		// Backspace
		if(data.charCodeAt(0) === 127) { 
			// Remove last character from string
			currentUserData = currentUserData.slice(0, -1); 
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(currentUserData);
		// Enter
		} else if(data === '\u000d') {
			process.stdout.write('\n');
			let action = currentUserData.split(' ')[0], value = currentUserData.split(' ')[1];
			currentUserData = '', process.stdout.clearLine(), process.stdout.cursorTo(0);
			actions(client, action, value);
		} else {
			currentUserData += data;
			process.stdout.write(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data" ${err}`);
	}
}

module.exports = (this_client) => { 
	client = this_client; 
	let stdin = process.openStdin();
		stdin.setRawMode(true);
		stdin.setEncoding('utf-8');
		stdin.addListener('data', getDataFromConsole);
}