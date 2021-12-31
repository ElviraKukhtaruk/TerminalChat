let Request    = require('./Request');
let file       = require('../others/AsyncFileOperations');

module.exports = () => {
    Request.addRequest('token', async function(socket, res){
        try {
            await file.write(`./token/token`, res.body.token);
        } catch(err) {
           console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while retrieving data from client: ${err}`);
        }
    });
}