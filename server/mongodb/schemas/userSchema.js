let {Schema, model} = require('mongoose');

const userSchema = new Schema({
	socket_id: String,
	username: { type: String, unique: true },
	password: String,
	salt: String,
	conversations: {type: [String], ref: 'Conversations'}
}, { collection: 'User' });


module.exports = model('User', userSchema);
