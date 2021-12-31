let readline = require('readline');

let rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

let question = query => new Promise(resolve => rl.question(query, resolve));

module.exports = async (client) => {
    let username = await question('Your username: ');
    let password = await question('Your password: ');
    client.send({header: {type: 'log_in'}, body: {username: username, password} });
}