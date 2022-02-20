let actions = require('./actions');
let currentUserData = '', client, isChat = false, chatName = '';

function getDataFromConsole(data){
	try{
		// Ctrl+c
		if(data.charCodeAt(0) === 3){ 
			if(isChat){ 
				console.log('Exit');
				process.stdout.clearLine(), process.stdout.cursorTo(0);
				client.send({header: {type: 'exit_chat'}, body: {chat: chatName} });
				isChat = false, chatName = '', currentUserData = '';
				delete client.currentChat;
			} else process.exit();
		// Backspace
		} else if(data.charCodeAt(0) === 127) { 
			// Remove last character from string
			currentUserData = currentUserData.slice(0, -1); 
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write(currentUserData);
		// Enter
		} else if(data.charCodeAt(0) === 13) {
			process.stdout.write('\n');
			let action = currentUserData.split(' ')[0], value = currentUserData.split(' ')[1],
			value2 = currentUserData.split(' ')[2];
			process.stdout.clearLine(), process.stdout.cursorTo(0);
			if(action == 'goto' && isChat == false){ 
				isChat = true, chatName = value, client.currentChat = value;
				actions(client, action, chatName);
			} else if(isChat) actions(client, 'sendMessage', currentUserData);
			else actions(client, action, value, value2);
			currentUserData = '';
		} else {
			currentUserData += data;
			process.stdout.write(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data" ${err}`);
	}
}

module.exports.userData = () => currentUserData;

module.exports.getDataFromConsole = (this_client) => { 
	client = this_client; 
	let stdin = process.openStdin();
		stdin.setRawMode(true);
		stdin.setEncoding('utf-8');
		stdin.addListener('data', getDataFromConsole);
}
