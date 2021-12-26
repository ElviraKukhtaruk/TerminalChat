let crypto = require('./encryption');

module.exports.decrypt = function(data, isObject){
    let dataObject = JSON.parse(data),
        authTag    = Buffer.from(dataObject.authTag),
        iv         = Buffer.from(dataObject.iv);
    let encryptedData = crypto.decryptData(dataObject.data, this.secret, authTag, iv).toString();
    return isObject ? JSON.parse(encryptedData) : encryptedData;
}

module.exports.encrypt = function(data){
    let encryptedData = crypto.encryptData(data, this.secret);
    //return JSON.stringify(encryptedData);
    this.write(JSON.stringify(encryptedData));
}
// { type: "message" }
// { type: "newChat" }
// { type: "createNewChat" }
// { type: "leaveChat" }
// { type: "deleteChat" }
