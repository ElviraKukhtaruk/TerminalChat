let Response = require('./Response');

let logIn = require('./responses/logIn');
let error = require('./responses/error');
let conversations = require('./responses/conversations');

module.exports = () => {
	Response.addResponse('error', error);
	Response.addResponse('get_chats', conversations.getChats);
	Response.addResponse('log_in', logIn);
	Response.addResponse('add_user_to_chat', conversations.showStatus);
	Response.addResponse('delete_user_from_chat', conversations.showStatus);
	Response.addResponse('newUsers', conversations.getNewUsers);	
}