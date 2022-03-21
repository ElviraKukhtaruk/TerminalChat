let readline = require('readline');
let file = require('../../../../shared/AsyncFileOperations');
let getData = require('../../userData/getData');


let rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let question = query => new Promise(resolve => rl.question(query, resolve));

module.exports = async (client) => {
	let token = await file.read('./token/token');
	if(token && await question('\nUse your token? (y/n) ') === 'y') {
		client.send({header: {type: 'log_in'}, body: {token} });
	} else {
		let request_type = await question('\nLogin or Registration? (l/r) ') == 'l' ? 'log_in' : 'registration';
		let username = await question('Your username: ');
		let password = await question('Your password: ');
		client.send({header: {type: request_type}, body: {username, password} });
	}	
	rl.close();
	getData.getDataFromConsole(client);
} 