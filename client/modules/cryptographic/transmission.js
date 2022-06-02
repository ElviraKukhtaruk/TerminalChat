let crypto = require('../../../shared/cryptographic/crypto');
let Response = require('../../response/Response');

module.exports.encrypt = function(data, callback){
    if(callback) Response.addResponse(data.header.type, callback, true);
	if(this.status === 'auth') data = JSON.stringify(data);
	let encryptedData = crypto.encryptData(data, this.secret);
	this.write(JSON.stringify(encryptedData));
}