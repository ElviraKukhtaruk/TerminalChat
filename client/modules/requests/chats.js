let Request    = require('./Request');
let timeFormat = require('../timeFormat');


module.exports.chats = () => {
    Request.addRequest('message', function(socket, request){
        try {
           console.log(`USER ${timeFormat()}> ${request.body.message}`);
        } catch(err) {
           console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while retrieving data from client: ${err}`);
        }
    });
}