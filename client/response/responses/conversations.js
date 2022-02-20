module.exports.showStatus = (socket, res) => {
	try {
		console.log(`Response: ${res.body.message}.`);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getChats = (socket, res) => {
	try {
		let indexOfAllChats = 0;
		let allChats = res.body.conversations.map((conversation, i) => conversation);
		console.log('\nYour Chats: ');
		let ownChats = res.body.ownConversations.map((conversation, i) => `${conversation} (Admin)`);
		let allChatsAndOwnChats = allChats.concat(ownChats).filter(item => item !== null);
		allChatsAndOwnChats.forEach((elem, i) => console.log(`${i}) ${elem}`));
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getNewUsers = (socket, res) => {
	try {
		let newUsers = res.body.newUsers;
		newUsers.forEach( users => {
			for (const property in users) console.log(`User: ${property}, Chat: ${users[property]}`);
		});		
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}
