module.exports = (client, action, value) => {
    switch(action){
        case 'join':
            client.send({header: {type: 'add_user_to_chat'}, body: {conversation_name: value} });
            break;
        case 'leave':
            client.send({header: {type: 'delete_user_from_chat'}, body: {conversation_name: value} });
            break;
        case 'show':
            if(value == 'newUsers' || value == 'globalChats') {
                client.send({header: {type: value}, body: {conversation_name: value} });
            } else console.log(`Value "${value}" not found`);
            break;
        default:
            console.log(`Action "${action}" not found`);
    }
}