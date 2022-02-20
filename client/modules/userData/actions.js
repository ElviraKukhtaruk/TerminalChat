module.exports = (client, action, value, value2) => {
    switch(action){
        case 'join':
            client.send({header: {type: 'join_chat'}, body: {conversation_name: value} });
            break;
        case 'leave':
            client.send({header: {type: 'leave_chat'}, body: {chat: value} });
            break;
        case 'show':
            if(value == 'newUsers' || value == 'globalChats') {
                client.send({header: {type: value}, body: {conversation_name: value} });
            } else console.log(`Value "${value}" not found`);
            break;
        case 'addUser':
            client.send({header: {type: 'add_user'}, body: {user: value, chat: value2} });
            break;
        case 'removeUser':
            client.send({header: {type: 'remove_user'}, body: {user: value, chat: value2} });
            break;
        case 'createChat':
            client.send({header: {type: 'create_chat'}, body: {chat: value} });
            break;
        case 'removeChat':
            client.send({header: {type: 'remove_chat'}, body: {chat: value} });
            break;
        case 'sendMessage':
            client.send({header: {type: 'send_message'}, body: {chat: value, message: value2} });
            break;
        default:
            console.log(`Action "${action}" not found`);
    }
}