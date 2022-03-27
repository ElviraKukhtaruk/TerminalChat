let actions = require('./actions');
let currentUserData = '', isChat = false, chatName = '';

module.exports.getDataFromConsole = function(data){
	try{
		switch(data.charCodeAt(0)){
			// Ctrl+C (exit)
			case 3:
				if(isChat){ 
					console.log('Exit');
					this.client.send({header: {type: 'exit_chat'}, body: {chat: chatName} });
					isChat = false, chatName = '', currentUserData = '';
				} else process.exit();
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
				if(parameters[0] == 'goto' && isChat == false ){ 
					isChat = true, chatName = parameters[1];
					actions(this.client, parameters[0], chatName);
				} else isChat ? actions(this.client, 'sendMessage', currentUserData) : actions(this.client, ...parameters);
				currentUserData = '';
				break;
			default:
				currentUserData += data;
				process.stdout.write(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data" ${err}`);
	}
}

module.exports.userData = () => currentUserData;