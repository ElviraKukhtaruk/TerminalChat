module.exports.showStatus = (socket, res) => {
	try {
		console.log(`Response: ${res.body.message}.`);
	} catch(err) {
		console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
	}
}

module.exports.getChats = (socket, res) => {
	try {
		console.log('\nAll Chats: ');
		let allChats = res.body.conversations;
			allChats.forEach((conversation, i) => console.log(`${i}) ${conversation}`));

		console.log('\nYour Chats: ');
		res.body.ownConversations.forEach((conversation, i) => { 
			let indexOfUsersChat = allChats.findIndex(conv => conv === conversation);
			if(indexOfUsersChat >= 0) console.log(`${i}) ${allChats[indexOfUsersChat]}`);
		});
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
