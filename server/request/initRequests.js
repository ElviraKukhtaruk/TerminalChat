let Request = require('./Request');

let chats   = require('./requests/getChats'); 
let logIn   = require('./requests/logIn');

module.exports = () => {
	Request.addRequest('get_chats', chats);
	Request.addRequest('log_in', logIn);
}
