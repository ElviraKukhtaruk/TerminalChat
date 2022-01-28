let Response = require('./Response');

let chats    = require('./responses/getChats'); 
let logIn    = require('./responses/logIn');
let error    = require('./responses/error');

module.exports = () => {
	Response.addResponse('error', error);
	Response.addResponse('get_chats', chats);
	Response.addResponse('log_in', logIn);
}