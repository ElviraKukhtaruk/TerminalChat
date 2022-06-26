let Response = require('../Response'); 

let showStatus = (client, res) => console.log(`\nResponse: ${res.body.message}.`);

Response.addResponse('join_chat', showStatus);
Response.addResponse('leave_chat', showStatus);
Response.addResponse('add_user', showStatus);
Response.addResponse('remove_user', showStatus);
Response.addResponse('create_chat', showStatus);
Response.addResponse('remove_chat', showStatus);

Response.addResponse('allChats', (client, res) => {
	res.body.conversations.forEach((chat_name, i) => console.log(`${i}) ${chat_name}`));
});

let getUsers = (client, res) => {
	res.body.users.forEach((username, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${username}`));
}

Response.addResponse('showUsers', getUsers);
Response.addResponse('showOnline', getUsers);

Response.addResponse('myChats', (client, res) => {
	let allChats = res.body.conversations.map(conversation  => conversation);
	console.log('\nYour Chats: ');
	let ownChats = res.body.ownConversations.map(conversation => `${conversation}`);
	allChats.forEach((chat, i) => ownChats.includes(chat) ? console.log(`${i}) ${chat} (Admin)`) : console.log(`${i}) ${chat}`));
});

Response.addResponse('newUsers', (client, res) => {
	let newUsers = res.body.newUsers;
	newUsers.forEach(users => {
		for (const property in users) console.log(`User: ${property}, Chat: ${users[property]}`);
	});		
});