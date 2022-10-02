let crypto = require('crypto');
let { promisify } = require('util');
let file = require('../AsyncFileOperations');
let randomBytesAsync = promisify(crypto.randomBytes);

module.exports.getPrivateStaticKey = async (pathToStaticKey) => {
	let readStaticKey = await file.read(pathToStaticKey);
	let staticKey = crypto.createPrivateKey({
		key: readStaticKey,
	});
	return staticKey;
}

module.exports.generateRandomId = async (bytes, format) => { 
	let id = await randomBytesAsync(bytes);
	return id.toString(format);
}

module.exports.generateToken = async () => {
	return await new Promise((resolve, reject) => {
		crypto.randomBytes(48, (err, buffer) => { err ? reject(err) : resolve(buffer.toString('hex'))});
	}); 
}

module.exports.hash = async (text, salt) => {
	if(!salt) salt = crypto.randomBytes(16).toString('hex');
	return new Promise((resolve, reject) => { 
		crypto.scrypt(text, salt, 64, (err, drivedKey) => err ? reject(err) : resolve({hash: drivedKey.toString('hex'), salt: salt}));
	});
}

module.exports.generateECDHKeys = () => {
	let keys = crypto.generateKeyPairSync('x25519');
	let exportedPublicKey = keys.publicKey.export({ type: 'spki', format: 'pem' });
	return { privateKey: keys.privateKey,
		publicKey: exportedPublicKey }
}


module.exports.encryptData = (data, secret) => {
	let IV = crypto.randomBytes(16);
	let cipher = crypto.createCipheriv('aes-256-gcm', secret, IV);
	let encryptedData = cipher.update(data, 'utf8', 'hex');
	encryptedData += cipher.final('hex');
	let authTag = cipher.getAuthTag();
	return { iv: IV, 
		authTag: authTag,
		data: encryptedData };
}


module.exports.decryptData = (data, secret, authTag, iv) => {
	authTag = Buffer.from(authTag), iv = Buffer.from(iv);
	let decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv);
	decipher.setAuthTag(authTag);
	let decrpyted = decipher.update(data, 'hex', 'utf8');
	decrpyted += decipher.final('utf8');
	return decrpyted;
}


module.exports.generateSecret = (publicKey, privateKey )=> { 
	let secret = crypto.diffieHellman({ publicKey: crypto.createPublicKey(publicKey), privateKey: privateKey });
	return secret;
}