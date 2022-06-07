let actions = require('./mainActions');
let chatActions = require('./chatActions');
let currentUserData = '', isChat = false, chatName = '';

let exitChat = (client) => {
	console.log('\nExit');
	client.send({header: {type: 'exit_chat'}, body: {chat: chatName} });
	isChat = false, chatName = '', currentUserData = '';
}

let doesThisChatExist = (client, res) => {
	console.log(`\n${res.body.message}`); 
	isChat = res.header.status != 'error';
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
				if(parameters[0] == 'goto' && isChat == false){ 
					chatName = parameters[1];
					this.client.send({header: {type: 'goto_chat'}, body: {chat: chatName}}, doesThisChatExist);
				}
				// If the first character is '/', then this is a chat action.
				else if(isChat && currentUserData[0] == '/') chatActions(this.client, currentUserData, chatName);
				else isChat ? actions(this.client, 'sendMessage', currentUserData) : actions(this.client, ...parameters);
				currentUserData = ''; 
				break;
			default:
				currentUserData += data;
				process.stdout.write(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data: ${err}`);
	}
}

module.exports.userData = () => currentUserData;
module.exports.exitChat = exitChat;