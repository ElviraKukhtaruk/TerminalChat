let Request = require('../../../Request');
let db = require('../../../../postgresql/postgresql');

Request.addRequest('myChats', async (socket, req, session) => {
	let query = 'SELECT name FROM groups INNER JOIN usergroups ON groups.id=fk_group WHERE fk_user=$1;';
	let conversations = await db.query(query, [session.user_id], false);
	let ownConversations = await db.Groups().find({fk_admin: session.user_id}, ['name', 'private'], false);
	socket.send({header: {type: req.header.type}, body: {conversations, ownConversations}});
});

Request.addRequest('newChats', async (socket, req, session) => {
	let query = 'SELECT name FROM groups INNER JOIN newusers ON groups.id=fk_group WHERE fk_user=$1;';
	let newChats = await db.query(query, [session.user_id], false);
	socket.send({header: {type: req.header.type}, body: {chats: newChats}});
});

Request.addRequest('showLink', async (socket, req, session) => {
	let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'link']);
	
	if(chat && chat[0].fk_admin == session.user_id) socket.send({header: {type: req.header.type}, body: {link: chat[0].link}});
	else socket.error('You do not own this chat', req.header.type);
});

Request.addRequest('allChats', async (socket, req) => {
	let allChats = await db.Groups().find({private: false}, ['name'], false);
	socket.send({header: {type: req.header.type}, body: {allChats}});
});