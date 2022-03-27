let Conversation = require('../../mongodb/schemas/conversation');
let User = require('../../mongodb/schemas/userSchema');
let error = require('./error');
let redis = require('../../redis/setAndGet');
let Socket = require('../../modules/sockets/Socket');

module.exports.joinChat = async (socket, req, session) => {
	try {
		let conversation = await Conversation.findOne({name: req.body.conversation_name});
		if(conversation && !conversation.users.includes(session.user_id)) {
        	await Conversation.findOneAndUpdate({name: req.body.conversation_name}, {$addToSet: {newUsers: session.user_id }});
        	socket.send({header: {type: req.header.type}, body: {message: `The request was sent to the admin`} });
		} else socket.error('The chat was not found or you are already a member of this chat', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.leaveChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {users: session.user_id }});
        if (chat){ 
			await User.findByIdAndUpdate(session.user_id, {$pull: {conversations: chat._id} });
			await redis.srem(req.body.chat, socket.id);
			socket.send({header: {type: req.header.type}, body: {message: 'You left the chat'} });
		} else socket.error('The chat was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.exitChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOne({name: req.body.chat});
		if(chat) await redis.srem(req.body.chat, socket.id);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getUsersChats = async (socket, req, session) => {
	try {
		let user = await User.findById(session.user_id).populate('conversations');
		let conversations = user.conversations.map(chats => chats ? chats.name : null);
		let findOwnConversations = await Conversation.find({admin: session.user_id}), ownConversations;
		if(findOwnConversations) ownConversations = findOwnConversations.map(chats => chats.name);
		socket.send({header: {type: req.header.type}, body: {conversations, ownConversations}});
	} catch(err) {
		error(socket, req, err);
	}
}


module.exports.gotoChat = async (socket, req, session) => {
    try {
        let user = await User.findById(session.user_id);
        let chat = user ? await Conversation.findOne({name: req.body.chat}) : null;
        if(chat && user.conversations.includes(chat._id)){
            // Delete user from the last chat they visited
            if(socket.currentChat) await redis.srem(socket.currentChat, socket.id);
            socket.currentChat = req.body.chat;
            Socket.addSocket(socket.id, socket);
            await redis.sadd(req.body.chat, socket.id);
            socket.send({header: {type: req.header.type}, body: {message: 'You have joined the chat'}});
        } else socket.error('You are not a member of this chat', req.header.type);
    } catch(err){
        error(socket, req, err);
    }
}

module.exports.getNewUsers = async (socket, req, session) => {
	try {
		let ownConversations = await Conversation.find({admin: session.user_id}).populate('newUsers'), newUsers = [];
		// Get each of the admin's chats
		ownConversations.map(chat => { 
			// Then find all the users who want to join admin's chat
			chat.newUsers.map(user => newUsers.push({[user.username]: chat.name} ));
		});
		socket.send({header: {type: req.header.type}, body: {newUsers}});
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getAllUsers = async (socket, req, session) => {
	try {
		let user = await User.findById(session.user_id);
		let conversation = await Conversation.findOne({name: req.body.conversation_name}).populate('users');
		if(conversation && user.conversations.includes(conversation._id)) {
			let users = conversation.users.map(user => user.username);
			socket.send({header: {type: req.header.type}, body: {users: users}});
		} else socket.error('You are not a member of this chat or this chat does not exist', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getAllOnlineUsers = async (socket, req, session) => {
	try {
		let user = await User.findById(session.user_id);
		let conversation = await Conversation.findOne({name: req.body.conversation_name});
		if(conversation && user.conversations.includes(conversation._id)) {

			let onlineUsers = await redis.smembers(req.body.conversation_name);
			let users = await Promise.all(onlineUsers.map(async socket_id => {
				let onlineUser = await User.findOne({socket_id: socket_id});
				return onlineUser.username;
			}));
			socket.send({header: {type: req.header.type}, body: {users: users}});
		} else socket.error('You are not a member of this chat or this chat does not exist', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getAllChats = async (socket, req, session) => {
	try {
		let allChats = await Conversation.find({}), allChatsArray = allChats.map(conversation => conversation.name);
		socket.send({header: {type: req.header.type}, body: {conversations: allChatsArray} });
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.addUser = async (socket, req, session) => {
	try {
		let user = await User.findOne({username: req.body.user}), chat = await Conversation.findOne({name: req.body.chat});
		let isUserInNewUsersList = user && chat ? chat.newUsers.includes(user._id) : false;
		if(chat && isUserInNewUsersList && session.user_id == chat.admin){ 

			await Conversation.findOneAndUpdate({name: req.body.chat}, {$addToSet: {users: user._id}});
			await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {newUsers: user._id}});
			await User.findOneAndUpdate({username: req.body.user}, {$addToSet: {conversations: chat._id}});
			socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully added to the chat'}});

		} else if(user && chat && session.user_id != chat.admin || !isUserInNewUsersList){
			socket.error('The user did not join the chat or you do not own this chat', req.header.type);
		} else socket.error('The chat or user was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.removeUser = async (socket, req, session) => {
	try {
		let user = await User.findOne({username: req.body.user}), chat = await Conversation.findOne({name: req.body.chat});
		if(user && chat && session.user_id == chat.admin){ 

			await redis.srem(req.body.chat, user.socket_id);
			chat = await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {users: user._id}});
			await User.findByIdAndUpdate(user._id, {$pull: {conversations: chat._id}});
			socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully removed from the chat'}});

		} else if(user && chat && session.user_id != chat.admin) socket.error('You do not own this chat', req.header.type);
		else socket.error('The chat or user was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.createChat = async (socket, req, session) => {
	try {
		let name = req.body.chat;
		let onlyLettersNumbersUnderscore = name.length <= 20 && name.length >= 1 ? /^\w+$/.test(name) : false;
		if(onlyLettersNumbersUnderscore && name.trim().length !== 0) {
			let chat = new Conversation({
				admin: session.user_id,
				name: name,
				users: [session.user_id],
				newUsers: []
			});
			let newDocument = await chat.save();
			await User.findByIdAndUpdate(session.user_id, {$addToSet: {conversations: newDocument._id}});
			socket.send({header: {type: req.header.type}, body: {message: 'The chat has been created'}});
		} else socket.error('Choose a name 1-20 characters long. Name can contain only letters, numbers or underline', req.header.type);
	} catch(err) {
		err.code === 11000 ? socket.error('A chat with this name already exists', req.header.type) : error(socket, req, err);
	}
}

module.exports.removeChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOne({name: req.body.chat});
		if(chat.admin == session.user_id){ 
			await redis.delete(req.body.chat);

			await Promise.all(chat.users.map(async user => { 
				await User.findByIdAndUpdate(user, {$pull: {conversations: chat._id} });
			}));

			await Conversation.findByIdAndDelete(chat._id);
			await User.findByIdAndUpdate(session.user_id, { $pull: {conversations: chat._id} });
			socket.send({header: {type: req.header.type}, body: {message: 'The chat has been deleted'}});
		} else socket.error('You do not own this chat', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

