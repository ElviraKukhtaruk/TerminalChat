const help = `
--------------------------
Join chat: join <chat name>
Leave chat: leave <chat name>
Show users who want to join your chat: show newUsers
Show your chats: show myChats
Show all available chats: show allChats
Add user to the chat: addUser <username> <chat name>
Remove user from chat: removeUser <username> <chat name>
Create chat: createChat <chat name>
Remove chat: removeChat <chat name>
Select chat: goto <chat name>
--------------------------
`;


module.exports = (client, action, value, value2) => {
    switch(action){
        case 'help':
            console.log(help);
            break;
        case 'join':
            client.send({header: {type: 'join_chat'}, body: {conversation_name: value} });
            break;
        case 'leave':
            client.send({header: {type: 'leave_chat'}, body: {chat: value} });
            break;
        case 'show':
            if(value == 'newUsers' || value == 'allChats' || value == 'myChats') {
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
        case 'goto':
            client.send({header: {type: 'goto_chat'}, body: {chat: value} });
            break;
        case 'sendMessage':
            client.send({header: {type: 'send_message'}, body: {text: value} });
            break;
        default:
            console.log(`Action "${action}" not found`);
    }
}