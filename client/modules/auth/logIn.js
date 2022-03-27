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

		let useToken = await question('\nUse your token? (yes/no) ');
		useToken = useToken.toLowerCase();
		let answerYes = ['yes', 'y'], answerNo = ['no', 'n'], answerLogin = ['login', 'l'], answerRegister = ['register', 'r'];
		

		if(answerYes.includes(useToken)) {
			let token = await file.read('./token');
			client.send({header: {type: 'log_in'}, body: {token} });
		} else if(answerNo.includes(useToken)){
			let request_type = await question('\nLogin or Register? (l/r) ');
			request_type = request_type.toLowerCase();
			login = answerLogin.includes(request_type) ? 'log_in' : false;
			register = answerRegister.includes(request_type) ? 'registration' : false;
			if(login || register) {
				let username = await question('Your username: ');
				let password = await question('Your password: ');
				client.send({header: {type: login || register}, body: {username, password} });
			} else console.log('Please answer login or register');
		} else console.log('Please answer yes or no.');
	
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