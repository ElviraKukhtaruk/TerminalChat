let actions = require('./mainActions');
let chatActions = require('./chatActions');
let currentUserData = '', userData = [], userDataCurrentIndex = 0, cursor = 0, isChat = false, chatName = '';

let exitChat = (client) => {
	console.log('\nExit');
	client.send({header: {type: 'exit_chat'}, body: {chat: chatName} });
	isChat = false, chatName = '', currentUserData = '';
}

let doesThisChatExist = (client, res) => {
	console.log(`\n${res.body.message}`); 
	isChat = res.header.status != 'error';
}


let dataHistory = () => {
	if(userData.length < 50) userData.push(currentUserData);
	else if(userData.length > 50) { 
		userData.shift();
		userData.push(currentUserData);
	}
	userDataCurrentIndex = userData.length;
}

let arrowKeys = (data) => {
	switch(data.charCodeAt(2)){
		// Up
		case 65:
			process.stdout.clearLine(); process.stdout.cursorTo(0);
			if(userDataCurrentIndex > 0) userDataCurrentIndex -= 1;
			currentUserData = userData[userDataCurrentIndex];
			process.stdout.write(currentUserData);
			break;
		// Down
		case 66:
			process.stdout.clearLine(); process.stdout.cursorTo(0);
			if(userDataCurrentIndex > userData.length-1) userDataCurrentIndex -= 1;
			if(userDataCurrentIndex < userData.length-1) userDataCurrentIndex += 1;
			currentUserData = userData[userDataCurrentIndex];
			process.stdout.write(currentUserData);
			break;
		// Right
		case 67:
			cursor += 1;
			console.log(currentUserData);
			process.stdout.cursorTo(4);
			break;
		// Left
		case 68:
			cursor -= 1;
			process.stdout.cursorTo(-1);
			
	}
}

module.exports.getDataFromConsole = function(data){
	try{
		switch(data.charCodeAt(0)){
			// Ctrl+C (exit)
			case 3:
				if(isChat) exitChat(this.client);
				else process.exit();
				break;
			// Backspace
			case 127:
				// Remove last character from string
				currentUserData = currentUserData.slice(0, -1); 
				process.stdout.clearLine(); process.stdout.cursorTo(0);
				process.stdout.write(currentUserData);
				break;
			// Enter
			case 13:
				let parameters = currentUserData.split(' ');
				dataHistory();
				if(parameters[0] == 'goto' && isChat == false){ 
					chatName = parameters[1];
					this.client.send({header: {type: 'goto_chat'}, body: {chat: chatName}}, doesThisChatExist);
				}
				// If the first character is '/', then this is a chat action.
				else if(isChat && currentUserData[0] == '/') chatActions(this.client, currentUserData, chatName);
				else isChat ? actions(this.client, 'sendMessage', currentUserData) : actions(this.client, ...parameters);
				currentUserData = ''; 
				break;
			// Control keys
			default:
				if(currentUserData) arrowKeys(data);
				// Check for arrow keys (65, 66, 67, 68)
				if(data.charCodeAt(2) < 65 || data.charCodeAt(2) > 68) {
					// Find non-printable characters
					let stringData = String(data).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
					currentUserData += stringData;
					process.stdout.write(stringData);
				}
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data: ${err}`);
	}
}

module.exports.userData = () => currentUserData;
module.exports.exitChat = exitChat;