let crypto = require('./encryption');

module.exports.get = (socket, data) => {
    let dataObject = JSON.parse(data),
        authTag    = Buffer.from(dataObject.authTag),
        iv         = Buffer.from(dataObject.iv);
    return crypto.decryptData(dataObject.data, socket.secret, authTag, iv).toString();
}

module.exports.set = (socket, data) => {
    let encryptedData = crypto.encryptData(data, socket.secret);
    return JSON.stringify(encryptedData);
}