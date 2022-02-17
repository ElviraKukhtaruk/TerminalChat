let {Schema, model} = require('mongoose');

const Conversation = new Schema({
	admin: String,
	name: {type: String, unique: true},
	users: [String],
	newUsers: [String]
}, { collection: 'Conversations' });


module.exports = model('Conversations', Conversation);
