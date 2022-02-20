let User = require('../../mongodb/schemas/userSchema'); 
let { generateToken } = require('../../../shared/cryptographic/crypto');
let redis = require('../../redis/setAndGet');
let error = require('./error');

module.exports = async (socket, req) => {
	try {
		let user = req.body.username ? await User.findOneAndUpdate({username: req.body.username}, {socket_id: socket.id}) : null;
		if(req.body.token && await redis.get(req.body.token)) {
			await redis.set(req.body.token, {socket_id: socket.id}), socket.token = req.body.token;
			let userToken = await redis.get(socket.token);
			await User.findByIdAndUpdate(userToken.user_id, {socket_id: socket.id});
			socket.send({header: {type: 'log_in'}, body: {} });
		} else if(user && user.password === req.body.password) {
			socket.token = await generateToken(); 
			await redis.set(socket.token, {user_id: user._id});
			socket.send({header: {type: 'log_in'}, body: {token: socket.token} });
		} else socket.error('Invalid username/password or your token has expired', req.header.type);
	} catch(err) {
		error(socket, req, err);
	}
}