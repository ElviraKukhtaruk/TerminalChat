let Request = require('../Request');
let error = require('./error');
let redis = require('../../redis/setAndGet');
let Socket = require('../../modules/sockets/Socket');
let User = require('../../mongodb/schemas/userSchema');

let sendMessage = function(member_id){
    let member = Socket.getSocket(member_id);
    let message = this.req.body.text.trim(), isSender = this.socket.id == member.id;
    if(member && message.length !== 0) member.send({header: {type: 'message'}, body: {
        username: this.user.username, text: message, isSender: isSender
    }});   
 }

Request.addRequest('send_message', async (socket, req, session) => {
    if(socket.currentChat && await redis.sismember(socket.currentChat, socket.id)){
        let members = await redis.smembers(socket.currentChat);
        let user = await User.findById(session.user_id);
        members.forEach(sendMessage.bind({user: user, req: req, socket: socket}));
    } else socket.error('You are not a member of this chat', req.header.type);
   
});