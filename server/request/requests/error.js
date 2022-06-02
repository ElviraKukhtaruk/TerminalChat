module.exports = (socket, req, err) => {
    console.log(`${socket.remoteAddress} - ${socket.status} An error occurred while receiving data, type: ${req.header.type}: ${err}`);
	socket.error('Check the correctness of the sent data', req.header.type);
}