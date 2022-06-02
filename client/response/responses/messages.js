let Response = require('../Response');
let { userData } = require('../../modules/userData/getData');
let timeFormat = require('../../../shared/timeFormat');


Response.addResponse('message', (client, res, session) => {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        if(res.body.isSender) process.stdout.write(`\x1b[33m|${timeFormat()}| ${res.body.username} >> ${res.body.text}\x1b[0m\n`);
        else console.log(`|${timeFormat()}| ${res.body.username} >> ${res.body.text}`);
        process.stdout.write(userData());
    } catch(err) {
        console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
    }
});