module.exports.showStatus = (socket, res) => {
	try {
		console.log(`Response: ${res.body.message}.`);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.allChats = (socket, res) => {
	try {
		res.body.conversations.forEach((chat_name, i) => console.log(`${i}) ${chat_name}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getAllUsers = (socket, res) => {
	try {
		res.body.users.forEach((username, i) => console.log(`${i}) ${username}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getUsersChats = (socket, res) => {
	try {
		let allChats = res.body.conversations.map(conversation  => conversation);
		console.log('\nYour Chats: ');
		let ownChats = res.body.ownConversations.map(conversation => `${conversation}`);
		allChats.forEach((chat, i) => ownChats.includes(chat) ? console.log(`${i}) ${chat} (Admin)`) : console.log(`${i}) ${chat}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getNewUsers = (socket, res) => {
	try {
		let newUsers = res.body.newUsers;
		newUsers.forEach(users => {
			for (const property in users) console.log(`User: ${property}, Chat: ${users[property]}`);
		});		
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}
