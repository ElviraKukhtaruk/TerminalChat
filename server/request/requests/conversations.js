let Request = require('../Request');
let db = require('../../postgresql/postgresql');
let error = require('./error');
let redis = require('../../redis/asyncMethods');
let sessionRedis = require('../../redis/userSessions');
let Socket = require('../../modules/sockets/Socket');
let { generateRandomId } = require('../../../shared/cryptographic/crypto');

Request.addRequest('join_chat', async (socket, req, session) => {
	try {
		let group = await db.Groups().find({name: req.body.conversation_name}, ['id', 'private']);
		let userInGroup = group ? await db.UserGroups().find({fk_group: group[0].id, fk_user: session.user_id}, ['id']) : null;
		if(group && !userInGroup && !group[0].private) {
			await db.NewUsers().insert({fk_user: session.user_id, fk_group: group[0].id});
        	socket.send({header: {type: req.header.type}, body: {message: 'The request was sent to the admin'} });
		} else socket.error('The chat was not found or you are already a member of this chat', req.header.type);
	} catch (err) {
		err.code == 23505 ? socket.error('You have already sent a request to the admin', req.header.type) : error(socket, req, err);
	}
});

Request.addRequest('leave_chat', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.chat}, ['id', 'fk_admin']);
	let userInGroup = chat ? await db.UserGroups().find({fk_group: chat[0].id, fk_user: session.user_id}, ['id']) : null;
    if(userInGroup){ 
		await db.UserGroups().delete({fk_user: session.user_id, fk_group: chat[0].id});
		await db.NewUsers().delete({fk_user: session.user_id, fk_group: chat[0].id});
		await redis.srem(req.body.chat, socket.id);
		socket.send({header: {type: req.header.type}, body: {message: 'You left the chat'} });
	} else socket.error('You are not a member of this chat or this chat was not found', req.header.type);
});

Request.addRequest('exit_chat', async (socket, req) => {
	let chat = await db.Groups().find({name: req.body.chat});
	if(chat) await redis.srem(req.body.chat, socket.id);
});

Request.addRequest('myChats', async (socket, req, session) => {
	let query = 'SELECT name FROM groups INNER JOIN usergroups ON groups.id=fk_group WHERE fk_user=$1;';
	let conversations = await db.query(query, [session.user_id], false);
	let ownConversations = await db.Groups().find({fk_admin: session.user_id}, ['name'], false);
	socket.send({header: {type: req.header.type}, body: {conversations, ownConversations}});
});

Request.addRequest('goto_chat', async (socket, req, session) => {
	let group = await db.Groups().find({name: req.body.chat}, ['id']);
	let userInChat = group ? await db.UserGroups().find({fk_user: session.user_id, fk_group: group[0].id}, ['id']) : null;
    if(userInChat){
        // Delete user from the last chat they visited
        if(socket.currentChat) await redis.srem(socket.currentChat, socket.id);
        socket.currentChat = req.body.chat;
        Socket.addSocket(socket.id, socket);
        await redis.sadd(req.body.chat, socket.id);
        socket.send({header: {type: req.header.type}, body: {message: 'You have joined the chat. (CTRL+C or type "/exit" to exit)'}});
    } else socket.send({header: {type: req.header.type, status: 'error'}, body: {message: 'You are not a member of this chat'}});
});

Request.addRequest('newUsers', async (socket, req, session) => {
	let groupsJoin = 'SELECT users.username, groups.name FROM newusers INNER JOIN groups ON fk_group=groups.id';
	let usersJoin = 'JOIN users ON fk_user=users.id WHERE fk_admin=$1;';
	let newUsers = await db.query(`${groupsJoin} ${usersJoin}`, [session.user_id], false);
	socket.send({header: {type: req.header.type}, body: {newUsers}});
});

Request.addRequest('newChats', async (socket, req, session) => {
	let query = 'SELECT name FROM groups INNER JOIN newusers ON groups.id=fk_group WHERE fk_user=$1;';
	let newChats = await db.query(query, [session.user_id], false);
	socket.send({header: {type: req.header.type}, body: {chats: newChats}});
});

Request.addRequest('showUsers', async (socket, req, session) => {
	let groupName = req.body.conversation_name;
	let group = await db.Groups().find({name: groupName}, ['id']);	
	let userInChat = group ? await db.UserGroups().find({fk_user: session.user_id, fk_group: group[0].id}, ['id']) : null;
	if(userInChat){
		let userGroupsJoin = 'SELECT username FROM users INNER JOIN usergroups ON users.id=fk_user';
		let groupsJoin = 'INNER JOIN groups ON fk_group=groups.id WHERE name=$1;';
		let users = await db.query(`${userGroupsJoin} ${groupsJoin}`, [groupName], false);
		socket.send({header: {type: req.header.type}, body: {users}});
	} else socket.error('You are not a member of this chat or this chat does not exist', req.header.type);
});

Request.addRequest('showOnline', async (socket, req, session) => {
	let group = await db.Groups().find({name: req.body.conversation_name}, ['id']);
	let userInChat = group ? await db.UserGroups().find({fk_user: session.user_id, fk_group: group[0].id}, ['id']) : null;
	if(userInChat){
		let onlineUsers = await redis.smembers(req.body.conversation_name);
		let users = await Promise.all(onlineUsers.map(async socket_id => {
			let user_session = await sessionRedis.find(`*:${socket_id}`, 1);
			let list = user_session ? await redis.lrange(user_session[0], 0, 1) : null;
			return list ? list[0] : [];
		}));
		socket.send({header: {type: req.header.type}, body: {users: [...new Set(users)]}});
	} else socket.error('You are not a member of this chat or this chat does not exist', req.header.type);
});

Request.addRequest('showLink', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'link']);
	
	if(chat && chat[0].fk_admin == session.user_id) socket.send({header: {type: req.header.type}, body: {link: chat[0].link}});
	else socket.error('You do not own this chat', req.header.type);
});

Request.addRequest('regLink', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'id']);

	if(chat && chat[0].fk_admin == session.user_id){
		let newLink = await generateRandomId(30, 'base64');
		await db.Groups().update({id: chat[0].id}, {link: newLink});
		socket.send({header: {type: req.header.type}, body: {link: newLink}});
	} else socket.error('You do not own this chat', req.header.type);
});

Request.addRequest('mode', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'id']);
	let mode = req.body.mode, message;

	if(chat && chat[0].fk_admin == session.user_id){
		switch (mode) {
			case 'private':
				await db.Groups().update({id: chat[0].id}, {private: true});
				message = 'Chat mode: private';
				break;
			case 'public':
				await db.Groups().update({id: chat[0].id}, {private: false});
				message = 'Chat mode: public';
				break;
			default:
				message = 'Wrong chat mode';
		}
		socket.send({header: {type: req.header.type}, body: {message}});
	} else socket.error('You do not own this chat', req.header.type);
});

Request.addRequest('link', async (socket, req, session) => {
	let chat = await db.Groups().find({link: req.body.link}, ['id']);
	let userInGroup = chat ? await db.UserGroups().find({fk_group: chat[0].id, fk_user: session.user_id}, ['id']) : null;

	if(chat && !userInGroup){
		await db.NewUsers().delete({fk_user: session.user_id, fk_group: chat[0].id});
		await db.UserGroups().insert({fk_user: session.user_id, fk_group: chat[0].id});
		socket.send({header: {type: req.header.type}, body: {message: 'You have been successfully added to the chat'}});
	} else socket.error('The chat was not found or you are already a member of this chat', req.header.type); 
});

Request.addRequest('allChats', async (socket, req) => {
	let allChats = await db.Groups().find({private: false}, ['name'], false);
	socket.send({header: {type: req.header.type}, body: {allChats}});
});

Request.addRequest('add_user', async (socket, req, session) => {
	let user = await db.Users().find({username: req.body.user}, ['id']);
	let chat = await db.Groups().find({name: req.body.chat}, ['id', 'fk_admin']);
	let userInNewUsers = user && chat ? await db.NewUsers().find({fk_user: user[0].id, fk_group: chat[0].id}, ['id']) : null;
	if(userInNewUsers && session.user_id == chat[0].fk_admin){ 
		await db.NewUsers().delete({fk_user: user[0].id, fk_group: chat[0].id});
		await db.UserGroups().insert({fk_user: user[0].id, fk_group: chat[0].id});
		socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully added to the chat'}});
	} else if((user && chat) && (session.user_id != chat[0].fk_admin || !userInNewUsers)){
		socket.error('The user did not join the chat or you do not own this chat', req.header.type);
	} else socket.error('The chat or user was not found', req.header.type);
});

Request.addRequest('remove_user', async (socket, req, session) => {
	let user = await db.Users().find({username: req.body.user}, ['id']);
	let chat = await db.Groups().find({name: req.body.chat}, ['id', 'fk_admin']);
	if(user && chat && session.user_id == chat[0].fk_admin){ 
		await sessionRedis.deleteUserFromChatByUsername(req.body.chat, req.body.user);
		await db.UserGroups().delete({fk_user: user[0].id, fk_group: chat[0].id});
		await db.NewUsers().delete({fk_user: user[0].id, fk_group: chat[0].id});
		socket.send({header: {type: req.header.type}, body: {message: 'The user has been successfully removed from the chat'}});
	} else if(user && chat && session.user_id != chat[0].fk_admin) socket.error('You do not own this chat', req.header.type);
	else socket.error('The chat or user was not found', req.header.type);
});

Request.addRequest('create_chat', async (socket, req, session) => {
	try {
		let name = req.body.chat, private = req.body.private;
		let onlyLettersNumbersUnderscore = name.length < 21 && name.length > 0 ? /^\w+$/.test(name) : false;
		if(onlyLettersNumbersUnderscore && name.trim().length !== 0) {
			private = private == 'private' ? true : false;
			let link = await generateRandomId(30, 'base64');
			let chat = await db.Groups().insert({fk_admin: session.user_id, name: name, private: private, link: link});
			await db.UserGroups().insert({fk_user: session.user_id, fk_group: chat[0].id});
			socket.send({header: {type: req.header.type}, body: {message: 'The chat has been created'}});
		} else socket.error('Choose a name 1-20 characters long. Name can contain only letters, numbers or underline', req.header.type);
	} catch(err) {
		err.code == 23505 ? socket.error('A chat with this name already exists', req.header.type) : error(socket, req, err);
	}
});

Request.addRequest('remove_chat', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.chat}, ['id', 'fk_admin']);
	if(chat && chat[0].fk_admin == session.user_id){ 
		await redis.delete(req.body.chat);
		await db.Groups().delete({id: chat[0].id});
		socket.send({header: {type: req.header.type}, body: {message: 'The chat has been deleted'}});
	} else socket.error('You do not own this chat', req.header.type);
});