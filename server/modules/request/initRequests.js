let Request = require('../../requests/Request');

let chats   = require('../../requests/chats'); 
let logIn   = require('../../requests/logIn');

module.exports = () => {
    Request.addRequest('message', chats);
    Request.addRequest('log_in', logIn);
}