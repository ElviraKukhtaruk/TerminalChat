let error = require('./error');
let redis = require('../../redis/setAndGet');
let Socket = require('../../modules/sockets/Socket');
let User = require('../../mongodb/schemas/userSchema');

module.exports.sendMessage = async (socket, req, session) => {
    try {
        if(socket.currentChat && await redis.sismember(socket.currentChat, socket.id)){
            let members = await redis.smembers(socket.currentChat);
            let user = await User.findById(session.user_id);
            members.forEach(async member_id => {
                let member = Socket.getSocket(member_id);
                let message = req.body.text.trim();
                if(socket.id != member.id && message.length !== 0) member.send({header: {type: 'message'}, body: {
                    username: user.username, text: message
                }});   
            });
        } else socket.error('You are not a member of this chat', req.header.type);
    } catch(err) {
        error(socket, req, err);
    }
}