let Response = require('../Response');
let { cli } = require('../../modules/userData/cli/cli');
let { chat } = require('../../modules/userData/chat/chat');


Response.addResponse('message', async (client, res) => {
    let text = String(res.body.text).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
    let username = String(res.body.username).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
    await chat.newMessage(res.body.isSender, username, text);
    process.stdout.write(cli.currentData);
});