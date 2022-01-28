let {Schema, model} = require('mongoose');

const userSchema = new Schema({
	username: { type: String, unique: true },
	password: String,
	socket_id: { type: String, unique: true },
	userConversations: [String],
	conversations: [String]
}, { collection: 'User' });


module.exports = model('User', userSchema);
