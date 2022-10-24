let actions = require('./mainActions');
let chatActions = require('./chatActions');

let cli = {
	currentData: '',
	cursor: 0,
	row: 1,
	startTextYPosition: 0,
	dataIndex: 0,
	history: []
};
let chat = {
	chatName: '',
	isChat: false
};

const getCursorYPos = () => new Promise((resolve) => {
    const termcodes = { cursorGetPosition: '\u001b[6n' };
    const readfx = function () {
		try{
        	const buf = process.stdin.read();
			//process.stdout.resume();
        	const str = JSON.stringify(buf); // "\u001b[9;1R"
        	const regex = /\[(.*)/g;
        	const y = regex.exec(str)[0].replace(/\[|R"/g, '').split(';');
        	const pos = y[0];
        	resolve(Number(pos));
		} catch(err){ }
    };
	process.stdin.once('readable', readfx);
    process.stdout.write(termcodes.cursorGetPosition);
	//process.stdout.pause();
});

let exitChat = (client) => {
	console.log('\nExit');
	client.send({header: {type: 'exit_chat'}, body: {chat: chat.chatName} });
	chat.isChat = false, chat.chatName = '', cli.currentData = '';
}

let doesThisChatExist = (client, res) => {
	console.log(`\n${res.body.message}`); 
	chat.isChat = res.header.status != 'error';
}

let printCharacter = async (data) => {
		// Escape non-printable characters
		let stringData = String(data).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
		// If it is first row and column, set start text Y position of cursor
		if(cli.row == 1) cli.startTextYPosition = await getCursorYPos();
		cli.currentData += stringData;
		process.stdout.write(stringData);
		cli.cursor += stringData.length;
		// Next line
		if(cli.cursor > process.stdout.columns && cli.cursor % process.stdout.columns == 1){ 
			let currentRowCount = Math.ceil(cli.cursor / process.stdout.columns);
			if(cli.row < currentRowCount) cli.row += 1;
		}
}

let dataHistory = () => {
	let currentRowCount = Math.ceil(cli.cursor / process.stdout.columns);
	if(cli.history.length <= 50 && cli.currentData) cli.history.push({text: cli.currentData, row: currentRowCount});
	// Set max. command history length
	else if(cli.history.length >= 50 && cli.currentData) { 
		cli.history.shift();
		cli.history.push({text: cli.currentData, row: currentRowCount});
	} cli.dataIndex = cli.history.length;
	if(!chat.isChat) cli.cursor = 0, cli.row = 1, cli.startTextYPosition = 0;
}

let removeLines = async (cli, isSender) => {
	let rowDeleted = 0;
	cli.startTextYPosition = await getCursorYPos();
	let endOfTextBlock = cli.startTextYPosition <= process.stdout.rows ? cli.startTextYPosition : process.stdout.rows;
	while(rowDeleted <= cli.row){
		process.stdout.cursorTo(0, endOfTextBlock - rowDeleted); process.stdout.clearLine();
		rowDeleted += 1;
	} if(isSender){
		cli.startTextYPosition = await getCursorYPos(), cli.cursor = 0; cli.row = 1;
		cli.startTextYPosition = 0;
	}
}

let removeLinesHostory = async () => {
	let rowDeleted = 0;
	cli.startTextYPosition = await getCursorYPos();
	let endOfTextBlock = cli.startTextYPosition <= process.stdout.rows ? cli.startTextYPosition : process.stdout.rows;
	while(rowDeleted <= cli.row){
		process.stdout.cursorTo(0, endOfTextBlock - rowDeleted); process.stdout.clearLine();
		rowDeleted += 1;
	}
	cli.currentData = cli.history[cli.dataIndex].text, cli.row = cli.history[cli.dataIndex].row;
	cli.cursor = cli.currentData.length, cli.startTextYPosition = await getCursorYPos();
}


let arrowKeys = async (data) => {
	switch(data.charCodeAt(2)){
		// Up
		case 65:
			if(cli.dataIndex > 0) cli.dataIndex -= 1;
			await removeLinesHostory();
			process.stdout.write(cli.currentData);
			break;
		// Down
		case 66:
			if(cli.dataIndex > cli.history.length-1) cli.dataIndex -= 1;
			if(cli.dataIndex < cli.history.length-1) cli.dataIndex += 1;
			await removeLinesHostory();
			process.stdout.write(cli.currentData);
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

module.exports.getDataFromConsole = async function(data){
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
				let newText = cli.currentData.slice(0, cli.cursor-1) + cli.currentData.slice(cli.cursor);
				cli.currentData = newText;

				let yPos = await getCursorYPos();
				let endOfTextBlock = cli.startTextYPosition ? cli.startTextYPosition + (cli.row-1) : yPos;
				
				endOfTextBlock = endOfTextBlock <= process.stdout.rows ? endOfTextBlock : process.stdout.rows;
				if(cli.cursor > 0) cli.cursor -= 1;
				
				let rowDeleted = 0;
				while(rowDeleted <= cli.row){
					process.stdout.cursorTo(0, endOfTextBlock - rowDeleted); process.stdout.clearLine();
					rowDeleted += 1;
				}
				process.stdout.write(cli.currentData);
				break;
			// Enter
			case 13:
				let parameters = cli.currentData.split(' ');
				dataHistory();
				if(parameters[0] == 'goto' && chat.isChat == false){ 
					chat.chatName = parameters[1];
					this.client.send({header: {type: 'goto_chat'}, body: {chat: chat.chatName}}, doesThisChatExist);
				}
				// If the first character is '/', then this is a chat action.
				else if(chat.isChat && cli.currentData[0] == '/') chatActions(this.client, cli.currentData, chat.chatName);
				else chat.isChat ? actions(this.client, 'sendMessage', cli.currentData) : actions(this.client, ...parameters);
				cli.currentData = ''; 
				break;
			// Control keys
			case 27:
				let code = data.charCodeAt(2);
				if(cli.history.length || (!cli.history.length && (code == 67 || code == 68))) await arrowKeys(data);
				if((!/[\u001b]/.test(data)) && code < 65 || code > 68) await printCharacter(data);
				break;
			default:
				let a = data;
				await printCharacter(data);
		}
	} catch(err) {
		console.log(`An error occurred while processing the entered data or sending data: ${err}`);
	}
}

module.exports.userData = () => cli.currentData;
module.exports.cli = () => cli;
module.exports.exitChat = exitChat;
module.exports.removeLines = removeLines;