let Request = require('../../../../Request');
let db = require('../../../../../postgresql/postgresql');
let error = require('../../../errors/error');
let redis = require('../../../../../redis/asyncMethods');
let Socket = require('../../../../../modules/sockets/Socket');
let { generateRandomId } = require('../../../../../../shared/cryptographic/crypto');

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

Request.addRequest('create_chat', async (socket, req, session) => {
	try {
		let name = req.body.chat, mode = req.body.mode;
		let correctMode = mode ? mode == 'private' || mode == 'public' : true;
		let onlyLettersNumbersUnderscore = name.length < 21 && name.length > 0 ? /^\w+$/.test(name) : false;
		if(onlyLettersNumbersUnderscore && name.trim().length !== 0 && correctMode) {
			let link = await generateRandomId(30, 'base64'), private = mode == 'private' ? true : false;
			let chat = await db.Groups().insert({fk_admin: session.user_id, name: name, private: private, link: link});
			await db.UserGroups().insert({fk_user: session.user_id, fk_group: chat[0].id});
			socket.send({header: {type: req.header.type}, body: {message: 'The chat has been created'}});
		} else if(!correctMode) socket.error('Choose correct chat mode', req.header.type);
		else socket.error('Choose a name 1-20 characters long. Name can contain only letters, numbers or underline', req.header.type);
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