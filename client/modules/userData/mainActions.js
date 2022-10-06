const help = `
--------------------------
Chat:
Join chat: join <chat name>
Join chat via link: link <chat link>
Leave chat: leave <chat name>
Show your chats: show myChats
Show all available chats: show allChats
Show chats where you haven't been added yet: show newChats
Create chat: createChat <chat name>
Remove chat: removeChat <chat name>
Select chat: goto <chat name>
Show chat link: chat showLink <chat name>
Regenerate chat link: chat regLink <chat name>
Change chat mode: chat mode <chat name> <public|private>

Users:
Show users who want to join your chat: show newUsers
Show all online users: chat showOnline <chat name>
Show all users in chat: chat showUsers <chat name>
Add user to the chat: addUser <username> <chat name>
Remove user from the chat: removeUser <username> <chat name>

Chat actions:
/exit: Exit chat
/who: Show all online users in current chat
/users: Show all users in chat
--------------------------
`;


module.exports = (client, action, value, value2, value3) => {

    if(action != 'sendMessage') process.stdout.write('\n');

    switch(action){
        case 'help':
            console.log(help);
            break;
        case 'join':
            client.send({header: {type: 'join_chat'}, body: {conversation_name: value} });
            break;
        case 'link':
            client.send({header: {type: 'link'}, body: {link: value} });
            break;
        case 'leave':
            client.send({header: {type: 'leave_chat'}, body: {chat: value} });
            break;
        case 'chat':
            // showUsers, showOnline, showLink, regLink, mode: private/public
            client.send({header: {type: value}, body: {conversation_name: value2, mode: value3} });
            break;
        case 'show':
            // newUsers, allChats, myChats, newChats
            client.send({header: {type: value}, body: {} });
            break;
        case 'addUser':
            client.send({header: {type: 'add_user'}, body: {user: value, chat: value2} });
            break;
        case 'removeUser':
            client.send({header: {type: 'remove_user'}, body: {user: value, chat: value2} });
            break;
        case 'createChat': 
            client.send({header: {type: 'create_chat'}, body: {chat: value, private: value2} });
            break;
        case 'removeChat':
            client.send({header: {type: 'remove_chat'}, body: {chat: value} });
            break;
        case 'sendMessage':
            client.send({header: {type: 'send_message'}, body: {text: value} });
            break;
        default:
            if(action) console.log(`\nAction "${action}" not found`);
    }
}