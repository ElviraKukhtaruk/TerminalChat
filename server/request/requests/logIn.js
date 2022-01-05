let User   = require('../../mongodb/schemas/userSchema'); 
let { generateToken } = require('../../../shared/cryptographic/crypto');
let redis  = require('../../redis/setAndGet');

module.exports = async (socket, req) => {
	try {
		let user = await User.findOne({username: req.body.username});
		if(user && user.password === req.body.password){
			socket.status = 'full_auth', token = await generateToken();
			await redis.set(token, {user_id: user._id, socket_id: socket.id});
			socket.send({header: {type: 'token'}, body: {token: token} });
		} else socket.error('User not found or the password is incorrect', req.header.type);
	} catch(err) {
		console.log(`${socket.remoteAddress} - ${socket.status} An error occurred while receiving data, type: ${req.header.type}: ${err}`);
		socket.error('Check the correctness of the sent data', req.header.type);
	}
}
