let Request = require('../../../../Request');
let db = require('../../../../../postgresql/postgresql');
let { generateRandomId } = require('../../../../../../shared/cryptographic/crypto');

Request.addRequest('regLink', async (socket, req, session) => {
    let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'id']);
    let link = req.body.value ? req.body.value.length >= 1 && req.body.value.length <= 40 : true;

    if(chat && chat[0].fk_admin == session.user_id && link){
        let linkExist = req.body.value ? await db.Groups().find({link: req.body.value}, ['id']) : false;
        if(linkExist) socket.error('A chat with this link already exists', req.header.type);
        else {
            let newLink = req.body.value ? req.body.value : await generateRandomId(30, 'base64');
            await db.Groups().update({id: chat[0].id}, {link: newLink});
            socket.send({header: {type: req.header.type}, body: {link: newLink}});
        }
    } else socket.error('You do not own this chat (if you created your link, choose a link 1-40 characters long)', req.header.type);
});

Request.addRequest('mode', async (socket, req, session) => {
let chat = await db.Groups().find({name: req.body.conversation_name}, ['fk_admin', 'id']);
let mode = req.body.value, message;

if(chat && chat[0].fk_admin == session.user_id){
    switch (mode) {
        case 'private':
            await db.Groups().update({id: chat[0].id}, {private: true});
            message = 'Chat mode: private';
            break;
        case 'public':
            await db.Groups().update({id: chat[0].id}, {private: false});
            message = 'Chat mode: public';
            break;
        default:
            message = 'Wrong chat mode';
    }
    socket.send({header: {type: req.header.type}, body: {message}});
} else socket.error('You do not own this chat', req.header.type);
});

Request.addRequest('link', async (socket, req, session) => {
let chat = await db.Groups().find({link: req.body.link}, ['id']);
let userInGroup = chat ? await db.UserGroups().find({fk_group: chat[0].id, fk_user: session.user_id}, ['id']) : null;

if(chat && !userInGroup){
    await db.NewUsers().delete({fk_user: session.user_id, fk_group: chat[0].id});
    await db.UserGroups().insert({fk_user: session.user_id, fk_group: chat[0].id});
    socket.send({header: {type: req.header.type}, body: {message: 'You have been successfully added to the chat'}});
} else socket.error('The chat was not found or you are already a member of this chat', req.header.type); 
});