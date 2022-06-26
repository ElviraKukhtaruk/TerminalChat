let Request = require('../Request');
let User = require('../../mongodb/schemas/userSchema'); 
let { generateToken, hash } = require('../../../shared/cryptographic/crypto');
let redis = require('../../redis/setAndGet');
let error = require('./error');


Request.addRequest('log_in', async (socket, req) => {
	let user = req.body.username ? await User.findOneAndUpdate({username: req.body.username}, {socket_id: socket.id}) : null;
	let password = user && req.body.password ? await hash(req.body.password, user.salt) : null;
	if(req.body.token && await redis.get(req.body.token)) {

		socket.token = req.body.token, session = await redis.get(socket.token);
		await User.findByIdAndUpdate(session.user_id, {socket_id: socket.id});
		socket.send({header: {type: req.header.type}, body: {} });

	} else if(password && user.password === password.hash) {

		socket.token = await generateToken(); 
		await redis.set(socket.token, {user_id: user._id});
		socket.send({header: {type: req.header.type}, body: {token: socket.token} });

	} else socket.error('Invalid username/password or your token has expired', req.header.type);
});

Request.addRequest('registration', async (socket, req) => {
	try {
		let username = req.body.username;
		let onlyLettersNumbersUnderscore = username.length <= 20 && username.length >= 1 ? /^\w+$/.test(username) : false;
		if(onlyLettersNumbersUnderscore && username.trim().length !== 0) {
			let passwordHash = await hash(req.body.password);
			let user = new User({
				socket_id: socket.id,
				username: username,
				password: passwordHash.hash,
				salt: passwordHash.salt,
				conversations: []
			});
			let newUser = await user.save();
			socket.token = await generateToken(); 
			await redis.set(socket.token, {user_id: newUser._id});
			socket.send({header: {type: req.header.type}, body: {token: socket.token} });
		} else socket.error('Choose a username 1-20 characters long. Username can contain only letters, numbers or underline', req.header.type);

	} catch(err) {
		err.code === 11000 ? socket.error('User with this username already exists', req.header.type) : error(socket, req, err);
	}
});

