let {Schema, model} = require('mongoose');

const conversation = new Schema({
	users: [String] 
}, { collection: 'conversation' });


module.exports = model('conversation', conversation);
