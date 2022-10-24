let Response = require('../Response'); 

let showStatus = (client, res) => console.log(`\nResponse: ${res.body.message}.`);
let showLink = (client, res) => console.log(`\nChat link: ${res.body.link}`);

Response.addResponse('join_chat', showStatus);
Response.addResponse('leave_chat', showStatus);
Response.addResponse('add_user', showStatus);
Response.addResponse('remove_user', showStatus);
Response.addResponse('create_chat', showStatus);
Response.addResponse('remove_chat', showStatus);
Response.addResponse('link', showStatus);
Response.addResponse('mode', showStatus);
Response.addResponse('showLink', showLink);
Response.addResponse('regLink', showLink);

Response.addResponse('allChats', (client, res) => {
	res.body.allChats.forEach((chat, i) => console.log(`${i}) ${chat.name}`));
});

let getArrayData = (client, res) => { 
	switch(res.header.type){
		case 'showUsers':
			res.body.users.forEach((user, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${user.username}`));
			break;
		case 'showOnline':
			res.body.users.forEach((user, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${user}`));
			break;
		case 'newChats':
			res.body.chats.forEach((data, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${data.name}`));
	}
};

Response.addResponse('showUsers', getArrayData);
Response.addResponse('showOnline', getArrayData);
Response.addResponse('newChats', getArrayData);

Response.addResponse('myChats', (client, res) => {
	let allChats = res.body.conversations.map(chat => chat.name);
	console.log('\nYour Chats: ');
	let ownChats = res.body.ownConversations;
	allChats.forEach((chat, i) => { 
		if(!ownChats.find(e => e.name == chat)) console.log(`${i}) ${chat}`);
		else {
			let info = ownChats.find(e => e.private) ? '(Admin) (Private)' : '(Admin) (Public)';
			console.log(`${i}) ${chat} ${info}`);
		}
	});
});

Response.addResponse('newUsers', (client, res) => {
	let newUsers = res.body.newUsers;
	if(newUsers) newUsers.forEach(newUser => console.log(`User: ${newUser.username}, Chat: ${newUser.name}`));		
});