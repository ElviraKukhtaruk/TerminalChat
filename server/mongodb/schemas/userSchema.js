let {Schema, model} = require('mongoose');

const userSchema = new Schema({
	username: { type: String, unique: true },
	password: String,
	ownConversations: [String],
	conversations: [String]
}, { collection: 'User' });


module.exports = model('User', userSchema);
