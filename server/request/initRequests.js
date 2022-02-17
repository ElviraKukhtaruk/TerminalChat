let Request = require('./Request');

let logIn = require('./requests/logIn');
let conversations = require('./requests/conversations');

module.exports = () => {
	Request.addRequest('get_chats', conversations.getChat);
	Request.addRequest('log_in', logIn);
	Request.addRequest('add_user_to_chat', conversations.addUser);
	Request.addRequest('newUsers', conversations.getNewUsers);
}
