let {Schema, model} = require('mongoose');

const userSchema = new Schema({
	username: { type: String, unique: true },
	password: String,
	socket_id: { type: String, unique: true },
	сonversations: Schema.Types.Mixed 
}, { collection: 'User' });


module.exports = model('User', userSchema);
