let User = require('../../mongodb/schemas/userSchema'); 
let { generateToken, hash } = require('../../../shared/cryptographic/crypto');
let redis = require('../../redis/setAndGet');
let error = require('./error');

module.exports = async (socket, req) => {
	try {
		
		let passwordHash = await hash(req.body.password);
		let user = new User({
			socket_id: socket.id,
			username: req.body.username,
			password: passwordHash.hash,
			salt: passwordHash.salt,
			conversations: []
		});
		let newUser = await user.save();
		socket.token = await generateToken(); 
		await redis.set(socket.token, {user_id: newUser._id});
		socket.send({header: {type: req.header.type}, body: {token: socket.token} });

	} catch(err) {
		err.code === 11000 ? socket.error('User with this username already exists', req.header.type) : error(socket, req, err);
	}
}