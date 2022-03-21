let User = require('../../mongodb/schemas/userSchema'); 
let { generateToken, hash } = require('../../../shared/cryptographic/crypto');
let redis = require('../../redis/setAndGet');
let error = require('./error');

module.exports = async (socket, req) => {
	try {
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
	} catch(err) {
		error(socket, req, err);
	}
}