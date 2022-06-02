let Response = require('../Response'); 

let showStatus = (client, res) => {
	try {
		console.log(`\nResponse: ${res.body.message}.`);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

Response.addResponse('join_chat', showStatus);
Response.addResponse('leave_chat', showStatus);
Response.addResponse('add_user', showStatus);
Response.addResponse('remove_user', showStatus);
Response.addResponse('create_chat', showStatus);
Response.addResponse('remove_chat', showStatus);
//Response.addResponse('goto_chat', showStatus);

Response.addResponse('allChats', (client, res) => {
	try {
		res.body.conversations.forEach((chat_name, i) => console.log(`${i}) ${chat_name}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
});

let getUsers = (client, res) => {
	try {
		res.body.users.forEach((username, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${username}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

Response.addResponse('showUsers', getUsers);
Response.addResponse('showOnline', getUsers);

Response.addResponse('myChats', (client, res) => {
	try {
		let allChats = res.body.conversations.map(conversation  => conversation);
		console.log('\nYour Chats: ');
		let ownChats = res.body.ownConversations.map(conversation => `${conversation}`);
		allChats.forEach((chat, i) => ownChats.includes(chat) ? console.log(`${i}) ${chat} (Admin)`) : console.log(`${i}) ${chat}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
});

Response.addResponse('newUsers', (client, res) => {
	try {
		let newUsers = res.body.newUsers;
		newUsers.forEach(users => {
			for (const property in users) console.log(`User: ${property}, Chat: ${users[property]}`);
		});		
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
});