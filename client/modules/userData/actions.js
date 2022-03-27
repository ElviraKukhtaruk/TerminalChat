const help = `
--------------------------
Join chat: join <chat name>
Leave chat: leave <chat name>
Show users who want to join your chat: show newUsers
Show your chats: show myChats
Show all available chats: show allChats
Show all online users: chat showOnline <chat name>
Show all users in chat: chat showUsers <chat name>
Add user to the chat: addUser <username> <chat name>
Remove user from the chat: removeUser <username> <chat name>
Create chat: createChat <chat name>
Remove chat: removeChat <chat name>
Select chat: goto <chat name>
--------------------------
`;


module.exports = (client, action, value, value2) => {

    if(action == 'sendMessage') {
        process.stdout.clearLine(); process.stdout.cursorTo(0);
        process.stdout.write(`\x1b[33mYou >> ${value}\x1b[0m\n`)
    } else process.stdout.write('\n');

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
        case 'chat':
            if(value == 'showUsers' || value == 'showOnline') client.send({header: {type: value}, body: {conversation_name: value2} });
            else console.log(`Value "${value}" not found`);
            break;
        case 'show':
            if(value == 'newUsers' || value == 'allChats' || value == 'myChats') client.send({header: {type: value}, body: {} });
            else console.log(`Value "${value}" not found`);
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