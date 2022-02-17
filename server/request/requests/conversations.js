let Conversation = require('../../mongodb/schemas/conversation');
let User = require('../../mongodb/schemas/userSchema');
let error = require('./error');

module.exports.addUser = async (socket, req, session) => {
	try {
        let conversation = await Conversation.findOneAndUpdate({name: req.body.conversation_name}, {$addToSet: {newUsers: session.user_id }});
        if (conversation) socket.send({header: {type: req.header.type}, body: {message: `The request was sent to the admin`} });
		else socket.error('The chat was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getChat = async (socket, req, session) => {
	try {
		let user = await User.findById(session.user_id);
		let conversations = await Promise.all(user.conversations.map(async chats => { 
			let conversations = await Conversation.findById(chats);
			return conversations.name;
		}));
		let ownConversations = await Promise.all(user.ownConversations.map(async chats => { 
			let ownConversations = await Conversation.findById(chats);
			return ownConversations.name;
		}));
		socket.send({header: {type: req.header.type}, body: {conversations, ownConversations}});
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getNewUsers = async (socket, req, session) => {
	try {
		let user = await User.findById(session.user_id);
		let newUsersObject = new Object();
		let newUsers = await Promise.all(user.ownConversations.map(async chats => { 
			let ownConversations = await Conversation.findById(chats);
			let user = await User.findById(ownConversations.newUsers);
			newUsersObject[user.username] = ownConversations.name;
			return newUsersObject;
		}));
		socket.send({header: {type: req.header.type}, body: {newUsers}});
	} catch(err) {
		error(socket, req, err);
	}
}