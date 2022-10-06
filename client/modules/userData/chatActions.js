let getData = require('./getData');

const help = `
--------------------------
Chat actions:
/help: Show help
/exit: Exit chat
/who: Show all online users in chat
/users: Show all users in chat
--------------------------
`;


module.exports = (client, action, value) => {
    switch(action){
        case '/help':
            console.log(help);
            break;
        case '/exit':
            getData.exitChat(client);
            process.stdout.write('\n');
            break;
        case '/who':
            client.send({header: {type: 'showOnline'}, body: {conversation_name: value} });
            process.stdout.write('\n');
            break;
        case '/users':
            client.send({header: {type: 'showUsers'}, body: {conversation_name: value} });
            process.stdout.write('\n');
            break;
        default:
            client.send({header: {type: 'send_message'}, body: {text: action} });
    }
}

/*



let dataHistory = () => {
	if(userData.length < 50) userData.push(currentUserData);
	else if(userData.length > 50) { 
		userData.shift();
		userData.push(currentUserData);
	}
	userDataCurrentIndex = userData.length;
}

let arrowKeys = (data) => {
	console.log(userDataCurrentIndex);
	process.stdout.clearLine(); process.stdout.cursorTo(0);
	switch(data.charCodeAt(2)){
		// Arrow up
		case 65:
			if(userDataCurrentIndex > 0) userDataCurrentIndex -= 1;
			currentUserData = userData[userDataCurrentIndex];
			process.stdout.write(currentUserData);
			break;
		// Arrow down
		case 66:
			if(userDataCurrentIndex < userData.length-1) userDataCurrentIndex += 1;
			currentUserData = userData[userDataCurrentIndex];
			process.stdout.write(currentUserData);
			break;
	}
}
*/