let Request = require('../../../../Request');
let db = require('../../../../../postgresql/postgresql');
let sessionRedis = require('../../../../../redis/userSessions');

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