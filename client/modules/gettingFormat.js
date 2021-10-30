let crypto = require('./encryption');

module.exports = (socket, data) => {
    let dataObject = JSON.parse(data),
        authTag    = Buffer.from(dataObject.authTag),
        iv         = Buffer.from(dataObject.iv);
    return crypto.decryptData(dataObject.data, socket.secret, authTag, iv).toString();
}