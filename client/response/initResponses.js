let Response = require('./Response');

let chats    = require('./responses/chats'); 
let token    = require('./responses/token');
let error    = require('./responses/error');

module.exports = () => {
	Response.addResponse('error', error);
	Response.addResponse('message', chats);
	Response.addResponse('token', token);
}
