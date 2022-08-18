module.exports = (socket) => {
    try {
        let secret = socket.status == 'new_connection' ? 'pre-master' : 'master';
        let message = `Server: The handshake could not be completed - An error occurred while receiving public key for ${secret} secret from client`;
        socket.write(JSON.stringify({error: message}));
        socket.destroy();
    } catch (err) {
        console.log(`${socket.remoteAddress} - ${socket.status} - ECDH handshake error: ${err}`);
    }
}