let crypto = require('./encryption');

module.exports.decrypt = function(data){
    let dataObject = JSON.parse(data),
        authTag    = Buffer.from(dataObject.authTag),
        iv         = Buffer.from(dataObject.iv);
    return crypto.decryptData(dataObject.data, this.secret, authTag, iv).toString();
}

module.exports.encrypt = function(data){
    let encryptedData = crypto.encryptData(data, this.secret);
    this.write(JSON.stringify(encryptedData));
}
