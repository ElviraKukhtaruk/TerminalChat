let User = require('../../mongodb/schemas/userSchema'); 
let { generateToken, hash } = require('../../../shared/cryptographic/crypto');
let redis = require('../../redis/setAndGet');
let error = require('./error');

module.exports = async (socket, req) => {
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
}