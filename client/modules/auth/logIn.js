let readline = require('readline');
let file = require('../../../shared/AsyncFileOperations');
let { getDataFromConsole } = require('../userData/getData');
let dataCallback, question;


let logInOrRegister = async (client) => {
	let login = ['login', 'l'], register = ['register', 'r'];
	let request_type = await question('\nLogin or Register? (l/r) ');
	request_type = request_type.toLowerCase();
	login = login.includes(request_type) ? 'log_in' : false;
	register = register.includes(request_type) ? 'registration' : false;
	if(login || register) {
		let username = await question('Your username: '), password = await question('Your password: ');
		client.send({header: {type: login || register}, body: {username, password} });
	} else { 
		console.log('\x1b[31mPlease answer "login"/"l" or "register"/"r"\x1b[0m\n'); 
		await logInOrRegister(client); 
	}
}

let useUserToken = async (client) => {
	let useToken = await question('\nUse your token? (y/n) ');
	useToken = useToken.toLowerCase();
	let yes = ['yes', 'y'], no = ['no', 'n']
	if(yes.includes(useToken)) {
		let token = await file.read('./token');
		client.send({header: {type: 'log_in'}, body: {token} });
	} else if(no.includes(useToken)) await logInOrRegister(client);
	else {
		console.log('\x1b[31mPlease answer "yes"/"n" or "no"/"n".\x1b[0m\n'); 
		await useUserToken(client);
	}
}

module.exports = async (client) => {
	try {
		if(dataCallback) process.stdin.removeListener('data', dataCallback);
		var rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		question = query => new Promise(resolve => rl.question(query, resolve));
		await useUserToken(client);
		
		rl.close();
		dataCallback = getDataFromConsole.bind({client: client});
		process.stdin.resume();
		process.stdin.setRawMode(true);
		process.stdin.setEncoding('utf-8');
		process.stdin.addListener('data', dataCallback);

	} catch(err) {
		if(err.code === 'ENOENT'){ 
			console.log(`Token file does not exist, log in or register first. (Ctrl+C To Exit)`);
			rl.close();
		}
		else throw err;
	}
} 