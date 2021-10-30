let crypto = require('./encryption');

module.exports = (socket, data) =>{
    let encryptedData = crypto.encryptData(data, socket.secret);

    return JSON.stringify(encryptedData);
}