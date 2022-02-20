let Request = require('./Request');

let logIn = require('./requests/logIn');
let conversations = require('./requests/conversations');
let messages = require('./requests/messages');

module.exports = () => {
	Request.addRequest('get_chats', conversations.getChat);
	Request.addRequest('log_in', logIn);
	Request.addRequest('join_chat', conversations.joinChat);
	Request.addRequest('leave_chat', conversations.leaveChat);
	Request.addRequest('newUsers', conversations.getNewUsers);
	Request.addRequest('add_user', conversations.addUser);
	Request.addRequest('remove_user', conversations.removeUser);
	Request.addRequest('create_chat', conversations.createChat);
	Request.addRequest('remove_chat', conversations.removeChat);
	Request.addRequest('send_message', messages.sendMessage);
}
