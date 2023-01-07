let actions = require('./mainActions');
let chatActions = require('./chatActions');
let { cli } = require('./cli/cli');
let { chat } = require('./chat/chat');
let arrowKeys = require('./cli/arrowKeys');


module.exports.getDataFromConsole = async function(data){
	try{
		switch(data.charCodeAt(0)){
			// Ctrl+C (exit)
			case 3:
				if(chat.chatMode) chat.exitChat(this.client);
				else process.exit();
				break;
			// Backspace
			case 127:
				await cli.removeCharacter();
				process.stdout.write(cli.currentData);
				cli.updateXCursorPosition();
				break;
			// Enter
			case 13:
				let parameters = cli.currentData.split(' ');
				if(!chat.chatMode){ 
					cli.addDataToTheHistory();
					cli.cursor = 0, cli.row = 1, cli.startTextYPosition = 0;
				}
				if(parameters[0] == 'goto' && !chat.chatMode){ 
					chat.chatName = parameters[1];
					this.client.send({header: {type: 'goto_chat'}, body: {chat: chat.chatName}}, chat.doesThisChatExist.bind(chat));
				}
				// If the first character is '/', then this is a chat action.
				else if(chat.chatMode && cli.currentData[0] == '/') chatActions(this.client, cli.currentData, chat.chatName);
				else chat.chatMode ? actions(this.client, 'sendMessage', cli.currentData) : actions(this.client, ...parameters);
				cli.currentData = '';
				break;
			// Control keys
			case 27:
				let code = data.charCodeAt(2);
				if(cli.history.length || (!cli.history.length && (code == 67 || code == 68))) await arrowKeys(data);
				if((!/[\u001b]/.test(data)) && code < 65 || code > 68) await cli.printCharacter(data);
				break;
			default:
				await cli.printCharacter(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data: ${err}`);
	}
}