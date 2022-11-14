let Request = require('../../Request');
let { Users } = require('../../../postgresql/postgresql');
let { generateToken, hash } = require('../../../../shared/cryptographic/crypto');
let redis = require('../../../redis/asyncMethods');
let error = require('../errors/error');

Request.addRequest('log_in', async (socket, req) => {
	let user = req.body.username ? await Users().find({username: req.body.username}, ['salt', 'password', 'id', 'username']) : null;
	let password = user && req.body.password ? await hash(req.body.password, user[0].salt) : null;
	let session = req.body.token ? await redis.get(req.body.token) : null;

	if(session) {
		socket.token = req.body.token;
		let findUser = await Users().find({id: session.user_id}, ['username']);
		await redis.rpush(`${findUser[0].username}:${socket.id}`, findUser[0].username, socket.id);
		socket.send({header: {type: req.header.type}, body: {}});
	} else if(password && user[0].password === password.hash) {
		await redis.rpush(`${user[0].username}:${socket.id}`, user[0].username, socket.id);
		socket.token = await generateToken(); 
		await redis.set(socket.token, {user_id: user[0].id});
		socket.send({header: {type: req.header.type}, body: {token: socket.token} });
	} else socket.error('Invalid username/password or your token has expired', req.header.type);
});

Request.addRequest('registration', async (socket, req) => {
	try {
		let username = req.body.username;
		let onlyLettersNumbersUnderscore = username.length <= 20 && username.length >= 1 ? /^\w+$/.test(username) : false;
		if(onlyLettersNumbersUnderscore && username.trim().length !== 0) {
			let passwordHash = await hash(req.body.password);
			let newUser = await Users().insert({
				username: username,
				password: passwordHash.hash,
				salt: passwordHash.salt
			});
			socket.token = await generateToken(); 
			await redis.set(socket.token, {user_id: newUser[0].id});
			await redis.rpush(`${newUser[0].username}:${socket.id}`, newUser[0].username, socket.id);
			socket.send({header: {type: req.header.type}, body: {token: socket.token} });
		} else socket.error('Choose a username 1-20 characters long. Username can contain only letters, numbers or underline', req.header.type);

	} catch(err) {
		err.code == 23505 ? socket.error('User with this username already exists', req.header.type) : error(socket, req, err);
	}
});