let Response = require('../Response');
let { userData } = require('../../modules/userData/getData');


Response.addResponse('message', (client, res, session) => {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`${res.body.username} >> ${res.body.text}`);
        process.stdout.write(userData());
    } catch(err) {
        console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
    }
});