let crypto = require('./crypto');

module.exports.decrypt = function(data, isObject){
	let dataObject = JSON.parse(data),
		authTag    = Buffer.from(dataObject.authTag),
		iv         = Buffer.from(dataObject.iv);
	let encryptedData = crypto.decryptData(dataObject.data, this.secret, authTag, iv).toString();
	return isObject ? JSON.parse(encryptedData) : encryptedData;
}

module.exports.encrypt = function(data){
	if(this.status === 'auth') data = JSON.stringify(data);
	let encryptedData = crypto.encryptData(data, this.secret);
	this.write(JSON.stringify(encryptedData));
}