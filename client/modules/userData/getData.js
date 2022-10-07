let actions = require('./mainActions');
let chatActions = require('./chatActions');

let cli = {
	currentUserData: '',
	cursor: 0,
	userDataCurrentIndex: 0,
	history: []
};
let chat = {
	chatName: '',
	isChat: false
};

let exitChat = (client) => {
	console.log('\nExit');
	client.send({header: {type: 'exit_chat'}, body: {chat: chat.chatName} });
	chat.isChat = false, chat.chatName = '', cli.currentUserData = '';
}

let doesThisChatExist = (client, res) => {
	console.log(`\n${res.body.message}`); 
	chat.isChat = res.header.status != 'error';
}

let printCharacter = (data) => {
	// Escape non-printable characters
	let stringData = String(data).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
	cli.currentUserData += stringData;
	process.stdout.write(stringData);
	cli.cursor += stringData.length;
}

let dataHistory = () => {
	if(cli.history.length <= 50 && cli.currentUserData) cli.history.push(cli.currentUserData);
	// Set max. command history length
	else if(cli.history.length >= 50 && cli.currentUserData) { 
		cli.history.shift();
		cli.history.push(cli.currentUserData);
	} cli.userDataCurrentIndex = cli.history.length;
	cli.cursor = 0;
}

let arrowKeys = (data) => {
	switch(data.charCodeAt(2)){
		// Up
		case 65:
			process.stdout.clearLine(); process.stdout.cursorTo(0);
			if(cli.userDataCurrentIndex > 0) cli.userDataCurrentIndex -= 1;
			cli.currentUserData = cli.history[cli.userDataCurrentIndex];
			process.stdout.write(cli.currentUserData);
			cli.cursor = cli.currentUserData.length;
			break;
		// Down
		case 66:
			process.stdout.clearLine(); process.stdout.cursorTo(0);
			if(cli.userDataCurrentIndex > cli.history.length-1) cli.userDataCurrentIndex -= 1;
			if(cli.userDataCurrentIndex < cli.history.length-1) cli.userDataCurrentIndex += 1;
			cli.currentUserData = cli.history[cli.userDataCurrentIndex];
			process.stdout.write(cli.currentUserData);
			cli.cursor = cli.currentUserData.length;
			break;
		// Right
		case 67:
			cli.cursor += 1;
			process.stdout.cursorTo(cli.cursor);
			break;
		// Left
		case 68:
			if(cli.cursor > 0) cli.cursor -= 1;
			process.stdout.cursorTo(cli.cursor);	
	}
}

module.exports.getDataFromConsole = function(data){
	try{
		switch(data.charCodeAt(0)){
			// Ctrl+C (exit)
			case 3:
				if(chat.isChat) exitChat(this.client);
				else process.exit();
				break;
			// Backspace
			case 127:
				// Remove character from string
				let newText = cli.currentUserData.slice(0, cli.cursor-1) + cli.currentUserData.slice(cli.cursor);
				cli.currentUserData = newText;
				cli.cursor -= 1; 
				process.stdout.clearLine(); process.stdout.cursorTo(0);
				process.stdout.write(cli.currentUserData); process.stdout.cursorTo(cli.cursor);
				break;
			// Enter
			case 13:
				let parameters = cli.currentUserData.split(' ');
				dataHistory();
				if(parameters[0] == 'goto' && chat.isChat == false){ 
					chat.chatName = parameters[1];
					this.client.send({header: {type: 'goto_chat'}, body: {chat: chat.chatName}}, doesThisChatExist);
				}
				// If the first character is '/', then this is a chat action.
				else if(chat.isChat && cli.currentUserData[0] == '/') chatActions(this.client, cli.currentUserData, chat.chatName);
				else chat.isChat ? actions(this.client, 'sendMessage', cli.currentUserData) : actions(this.client, ...parameters);
				cli.currentUserData = ''; 
				break;
			// Control keys
			case 27:
				let code = data.charCodeAt(2);
				if(cli.history.length || (!cli.history.length && (code == 67 || code == 68))) arrowKeys(data);
				if(code < 65 || code > 68) printCharacter(data);
				break;
			default:
				printCharacter(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data: ${err}`);
	}
}

module.exports.userData = () => cli.currentUserData;
module.exports.exitChat = exitChat;