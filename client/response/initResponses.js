let Response = require('./Response');

let logIn = require('./responses/logIn');
let error = require('./responses/error');
let conversations = require('./responses/conversations');
let messages = require('./responses/messages');

module.exports = () => {
	Response.addResponse('error', error);
	Response.addResponse('log_in', logIn);
	Response.addResponse('registration', logIn);
	Response.addResponse('join_chat', conversations.showStatus);
	Response.addResponse('leave_chat', conversations.showStatus);
	Response.addResponse('myChats', conversations.getUsersChats);
	Response.addResponse('newUsers', conversations.getNewUsers);
	Response.addResponse('allChats', conversations.allChats);
	Response.addResponse('add_user', conversations.showStatus);
	Response.addResponse('remove_user', conversations.showStatus);
	Response.addResponse('create_chat', conversations.showStatus);
	Response.addResponse('remove_chat', conversations.showStatus);
	Response.addResponse('goto_chat', conversations.showStatus);
	Response.addResponse('message', messages.message);
}