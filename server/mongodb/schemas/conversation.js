let {Schema, model} = require('mongoose');

const Conversation = new Schema({
	admin: {type: String},
	name: {type: String, unique: true, required: true},
	users: {type: [String], ref: 'User'},
	newUsers: {type: [String], ref: 'User'}
}, { collection: 'Conversations' });


module.exports = model('Conversations', Conversation);
