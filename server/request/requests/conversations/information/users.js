let Request = require('../../../Request');
let db = require('../../../../postgresql/postgresql');
let redis = require('../../../../redis/asyncMethods');
let sessionRedis = require('../../../../redis/userSessions');

Request.addRequest('newUsers', async (socket, req, session) => {
	let groupsJoin = 'SELECT users.username, groups.name FROM newusers INNER JOIN groups ON fk_group=groups.id';
	let usersJoin = 'JOIN users ON fk_user=users.id WHERE fk_admin=$1;';
	let newUsers = await db.query(`${groupsJoin} ${usersJoin}`, [session.user_id], false);
	socket.send({header: {type: req.header.type}, body: {newUsers}});
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