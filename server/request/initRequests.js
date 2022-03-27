let Request = require('./Request');

let logIn = require('./requests/logIn');
let registration = require('./requests/registration');
let conversations = require('./requests/conversations');
let messages = require('./requests/messages');

module.exports = () => {
	Request.addRequest('log_in', logIn);
	Request.addRequest('registration', registration);
	Request.addRequest('join_chat', conversations.joinChat);
	Request.addRequest('leave_chat', conversations.leaveChat);
	Request.addRequest('myChats', conversations.getUsersChats);
	Request.addRequest('newUsers', conversations.getNewUsers);
	Request.addRequest('allChats', conversations.getAllChats);
	Request.addRequest('showUsers', conversations.getAllUsers);
	Request.addRequest('showOnline', conversations.getAllOnlineUsers);
	Request.addRequest('add_user', conversations.addUser);
	Request.addRequest('remove_user', conversations.removeUser);
	Request.addRequest('create_chat', conversations.createChat);
	Request.addRequest('remove_chat', conversations.removeChat);
	Request.addRequest('goto_chat', conversations.gotoChat);
	Request.addRequest('exit_chat', conversations.exitChat);
	Request.addRequest('send_message', messages.sendMessage);
}
