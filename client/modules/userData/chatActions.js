let getData = require('./getData');

const help = `
--------------------------
Chat actions:
/help: Show help
/exit: Exit chat
/who: Show all online users in chat
/users: Show all users in chat
--------------------------
`;


module.exports = (client, action, value) => {
    switch(action){
        case '/help':
            console.log(help);
            break;
        case '/exit':
            getData.exitChat(client);
            process.stdout.write('\n');
            break;
        case '/who':
            client.send({header: {type: 'showOnline'}, body: {conversation_name: value} });
            process.stdout.write('\n');
            break;
        case '/users':
            client.send({header: {type: 'showUsers'}, body: {conversation_name: value} });
            process.stdout.write('\n');
            break;
        default:
            client.send({header: {type: 'send_message'}, body: {text: action} });
    }
}