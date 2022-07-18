let Socket = require('../modules/sockets/Socket');

module.exports.set = (socket) => {
    const timeout = 30000;

    socket.timeoutID = setTimeout(() => { 
        try {
            if(socket.status != "auth"){
                console.log(`${socket.remoteAddress} - Timeout`);
                Socket.deleteSocket(socket);
                socket.destroy();
            }
        } catch(err) {
            console.log(`${socket.remoteAddress} - ${socket.status} - Error during the handshake timeout: ${err}`);
        }
    }, timeout);
}

module.exports.clear = (socket) => {
    try {
        clearTimeout(socket.timeoutID);
        Socket.deleteSocket(socket);
    } catch(err) {
        console.log(`${socket.remoteAddress} - ${socket.status} - Error during clearing timeout: ${err}`);
    }
}
