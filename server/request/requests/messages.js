let error = require('./error');
let redis = require('../../redis/setAndGet');
let Socket = require('../../modules/sockets/Socket');
let User = require('../../mongodb/schemas/userSchema');
let Conversation = require('../../mongodb/schemas/conversation');

module.exports.gotoChat = async (socket, req, session) => {
    try {
        let user = await User.findById(session.user_id);
        let chat = user ? await Conversation.findOne({name: req.body.chat}) : null;
        if(chat && user.conversations.includes(chat._id)){
            if(socket.currentChat) await redis.srem(socket.currentChat, socket.id);
            socket.currentChat = req.body.chat;
            Socket.addSocket(socket.id, socket);
            await redis.sadd(req.body.chat, socket.id);
            socket.send({header: {type: req.header.type}, body: {message: 'You have joined the chat'}});
        } else socket.error('You are not a member of this chat', req.header.type);
    } catch(err){
        error(socket, req, err);
    }
}

module.exports.sendMessage = async (socket, req, session) => {
    try {
        if(socket.currentChat && await redis.sismember(socket.currentChat, socket.id)){
            let members = await redis.smembers(socket.currentChat);
            let user = await User.findById(session.user_id);
            members.forEach(async member => {
                let findSocket = Socket.getSocket(member);
                if(socket.id != findSocket.id) findSocket.send({header: {type: 'message'}, body: {
                    username: user.username, text: req.body.text
                }});   
            });
        } else socket.error('You are not a member of this chat', req.header.type);
    } catch(err) {
        error(socket, req, err);
    }
}