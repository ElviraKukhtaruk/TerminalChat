let Response = require('../Response');
let { userData } = require('../../modules/userData/getData');
let timeFormat = require('../../../shared/timeFormat');


Response.addResponse('message', (client, res) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    let text = String(res.body.text).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
    let username = String(res.body.username).replace(/[\x00\x08\x0B\x0C\x0E-\x1F]/g, "");
    if(res.body.isSender) process.stdout.write(`\x1b[33m|${timeFormat()}| ${username} >> ${text}\x1b[0m\n`);
    else console.log(`|${timeFormat()}| ${username} >> ${text}`);
    process.stdout.write(userData());
});