let readline = require('readline');
let file = require('../../../shared/AsyncFileOperations');
let { getDataFromConsole } = require('../userData/getData');
let dataCallback;

module.exports = async (client) => {
	try {
		if(dataCallback) process.stdin.removeListener('data', dataCallback);

		let rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		let question = query => new Promise(resolve => rl.question(query, resolve));

		let useToken = await question('\nUse your token? (y/n) ');
		if(useToken === 'y') {
			let token = await file.read('./token');
			client.send({header: {type: 'log_in'}, body: {token} });
		} else {
			let request_type = await question('\nLogin or Registration? (l/r) ') == 'r' ? 'registration' : 'log_in';
			let username = await question('Your username: ');
			let password = await question('Your password: ');
			client.send({header: {type: request_type}, body: {username, password} });
		}	
		rl.close();

		dataCallback = getDataFromConsole.bind({client: client});
		process.stdin.resume();
		process.stdin.setRawMode(true);
		process.stdin.setEncoding('utf-8');
		process.stdin.addListener('data', dataCallback);

	} catch(err) {
		if(err.code === 'ENOENT') console.log(`Token file does not exist, log in or register first.`);
		else throw err;
	}
} 