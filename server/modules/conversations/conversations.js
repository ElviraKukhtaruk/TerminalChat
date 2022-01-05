const Conversation = require('../../mongodb/schemas/conversation');


module.exports.addUser = async (conversation_id, socket_id) => {
	let conversation = await Conversation.findById(conversation_id);
	if (conversation){
		conversation.users.push(socket_id);
		await Conversation.findByIdAndUpdate(conversation_id, {users: conversation.users});
	}
}

module.exports.deleteUser = async (conversation_id, socket_id) => {
	let conversation = await Conversation.findById(conversation_id);
	if (conversation){
		conversation.users.pull(socket_id)
		await Conversation.findByIdAndUpdate(conversation_id, {users: conversation.users});
	}
} 
