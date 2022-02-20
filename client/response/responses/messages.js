let userData = require('../../modules/userData/getData');

module.exports.message = async (socket, res, session) => {
    try {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`${res.body.username} >> ${res.body.text}`);
        process.stdout.write(userData.userData());
    } catch(err) {
        console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
    }
}