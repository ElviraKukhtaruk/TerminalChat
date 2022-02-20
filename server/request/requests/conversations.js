let Conversation = require('../../mongodb/schemas/conversation');
let User = require('../../mongodb/schemas/userSchema');
let error = require('./error');
let redis = require('../../redis/setAndGet');

module.exports.joinChat = async (socket, req, session) => {
	try {
        let conversation = await Conversation.findOneAndUpdate({name: req.body.conversation_name}, {$addToSet: {newUsers: session.user_id }});
        if (conversation) socket.send({header: {type: req.header.type}, body: {message: `The request was sent to the admin`} });
		else socket.error('The chat was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.leaveChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {users: session.user_id }});
		await User.findByIdAndUpdate(session.user_id, {$pull: {conversations: chat._id} });
        if (chat){ 
			await redis.srem(req.body.chat, socket.id);
			socket.send({header: {type: req.header.type}, body: {message: 'You left the chat'} });
		}
		else socket.error('The chat was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.exitChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOne({name: req.body.chat});
		if(chat) await redis.srem(req.body.chat, socket.id);
		else socket.error('The chat was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.getChat = async (socket, req, session) => {
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

module.exports.getNewUsers = async (socket, req, session) => {
	try {
		let newUsers = [];
		let ownConversations = await Conversation.find({admin: session.user_id}).populate('newUsers');
		await Promise.all(ownConversations.map(async chats => { 
			await Promise.all(chats.newUsers.map(async userId => {
				let user = await User.findById(userId);
				newUsers.push({[user.username]: chats.name});
			}));
		}));
		socket.send({header: {type: req.header.type}, body: {newUsers}});
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.addUser = async (socket, req, session) => {
	try {
		let user = await User.findOne({username: req.body.user}), chat = await Conversation.findOne({name: req.body.chat});
		let isUserInNewUsersList = user ? chat.newUsers.includes(user._id) : false;
		if(user && chat && session.user_id == chat.admin && isUserInNewUsersList){ 

			await Conversation.findOneAndUpdate({name: req.body.chat}, {$addToSet: {users: user._id}});
			await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {newUsers: user._id}});
			await User.findOneAndUpdate({username: req.body.user}, {$addToSet: {conversations: chat._id}});
			socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully added to the chat'}});

		} else if(user && chat && session.user_id != chat.admin || !isUserInNewUsersList){
			socket.error('The user is not in the list of new users, or you are not the chat admin', req.header.type);
		} else socket.error('The chat or user was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.removeUser = async (socket, req, session) => {
	try {
		let user = await User.findOne({username: req.body.user}), chat = await Conversation.findOne({name: req.body.chat});
		if(user && chat && session.user_id == chat.admin){ 
			let findUserSocketId = await redis.get(`socketId:${user._id.toString()}`);
			if(findUserSocketId.socket_id) await redis.srem(req.body.chat, findUserSocketId.socket_id);
			chat = await Conversation.findOneAndUpdate({name: req.body.chat}, {$pull: {users: user._id}});
			await User.findOneAndUpdate({username: req.body.user}, {$pull: {conversations: chat._id}});
			socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully removed from the chat'}});

		} else if(user && chat && session.user_id != chat.admin){
			socket.error('You are not the chat admin', req.header.type);
		} else socket.error('The chat or user was not found', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.createChat = async (socket, req, session) => {
	try {
		let chat = new Conversation({
			name: req.body.chat,
			admin: session.user_id,
			newUsers: []
		});
		chat.users.push(session.user_id);
		chat.save(async ( err, doc ) => {
			if(!err){ 
				await User.findByIdAndUpdate(session.user_id, {$addToSet: {conversations: doc._id}});
				socket.send({header: {type: req.header.type}, body: {message: 'The chat has been created'}});
			} else if(err.code === 11000) socket.error('A chat with that name already exists', req.header.type);
			else socket.error('An error occurred during the creation of the chat', req.header.type);
		});
	} catch(err) {
		error(socket, req, err);
	}
}

module.exports.removeChat = async (socket, req, session) => {
	try {
		let chat = await Conversation.findOne({name: req.body.chat}).populate('users');
		if(chat.admin == session.user_id){ 
			await redis.delete(req.body.chat);
			await Promise.all(chat.users.map(async user => await User.findByIdAndUpdate(user._id, {$pull: {conversations: chat._id} })));
			await Conversation.findByIdAndDelete(chat._id);
			await User.findByIdAndUpdate(session.user_id, { $pull: {conversations: chat._id} });
			socket.send({header: {type: req.header.type}, body: {message: 'The chat has been deleted'}});
		} else {
			socket.error('You are not the chat admin', req.header.type);
		}
		
	} catch(err) {
		error(socket, req, err);
	}
}