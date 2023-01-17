let Response = require('../Response'); 

let showStatus = (client, res) => console.log(`\nResponse: ${res.body.message}.`);
let showLink = (client, res) => console.log(`\nChat link: ${res.body.link}`);


Response.addResponses(
	['join_chat', 'leave_chat', 'add_user', 'remove_user', 'create_chat', 'remove_chat', 'link', 'mode'],
	showStatus
);
Response.addResponses(['showLink', 'regLink'], showLink);

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
			break;
		case 'allChats':
			res.body.allChats.forEach((chat, i) => console.log('\x1b[36m%s\x1b[0m', `${i}) ${chat.name}`));
	}
};

Response.addResponses(['showUsers', 'showOnline', 'newChats', 'allChats'], getArrayData);

Response.addResponse('myChats', (client, res) => {
	let allChats = res.body.conversations;
	console.log('\nYour Chats: ');
	let ownChats = res.body.ownConversations;
	
	allChats.forEach((chat, i) => { 
		let ownChat = ownChats.find(e => e.name == chat.name);
		if(ownChat) console.log(`${i}) ${chat.name} (Admin) (${ownChat.private ? 'Private' : 'Public'})`);
		else console.log(`${i}) ${chat.name}`);
	});
});

Response.addResponse('newUsers', (client, res) => {
	let newUsers = res.body.newUsers;
	if(newUsers) newUsers.forEach(newUser => console.log(`User: ${newUser.username}, Chat: ${newUser.name}`));		
});