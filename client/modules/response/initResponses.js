let Request = require('../../responses/Request');

let chats   = require('../../responses/chats'); 
let token   = require('../../responses/token');
let error   = require('../../responses/error');

module.exports = () => {
    Request.addRequest('error', error);
    Request.addRequest('message', chats);
    Request.addRequest('token', token);
}