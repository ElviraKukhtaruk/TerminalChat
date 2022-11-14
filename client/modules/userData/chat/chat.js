let { cli } = require("../cli/cli");
let timeFormat = require('../../../../shared/timeFormat');

module.exports.chat = {
    chatName: '',
    chatMode: false,

    exitChat: function(client){
        console.log('\nExit');
	    client.send({header: {type: 'exit_chat'}, body: {chat: this.chatName} });
        cli.currentData = '', this.chatMode = false, this.chatName = '';
    },

    doesThisChatExist: function(client, res){
        console.log(`\n${res.body.message}`); 
	    this.chatMode = res.header.status != 'error';
    },
    
    newMessage: async function(isSender, username, text){
        await cli.removeOldText();
        if(isSender) { 
            cli.cursor = 0, cli.row = 1, cli.startTextYPosition = 0;
            process.stdout.write(`|${timeFormat()}| ${username} >> ${text}\n`);
        } else { 
            console.log(`\x1b[33m|${timeFormat()}| ${username} >> ${text}\x1b[0m`);
            cli.startTextYPosition = await cli.getCursorYPos();
        }
    }
};