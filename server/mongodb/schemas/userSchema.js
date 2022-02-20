let {Schema, model} = require('mongoose');

const userSchema = new Schema({
	username: { type: String, unique: true },
	password: String,
	conversations: {type: [String], ref: 'Conversations'}
}, { collection: 'User' });


module.exports = model('User', userSchema);
