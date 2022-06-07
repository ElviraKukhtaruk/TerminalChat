let getData = require('./getData');

const help = `
--------------------------
Chat actions:
/help: Show help
/exit: Exit chat
/who: Show all online users in current chat
/users: Show all users in chat
--------------------------
`;


module.exports = (client, action, value, value2) => {

    process.stdout.write('\n');

    switch(action){
        case '/help':
            console.log(help);
            break;
        case '/exit':
            getData.exitChat(client);
            break;
        case '/who':
            client.send({header: {type: 'showOnline'}, body: {conversation_name: value} });
            break;
        case '/users':
            client.send({header: {type: 'showUsers'}, body: {conversation_name: value} });
            break;
        default:
            if(action) console.log(`\nAction "${action}" not found`);
    }
}