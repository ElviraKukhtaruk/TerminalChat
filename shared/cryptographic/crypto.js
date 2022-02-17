let crypto = require('crypto');
let file = require('../AsyncFileOperations');

let IV;

module.exports.getPrivateStaticKey = async (pathToStaticKey) => {
	let readStaticKey = await file.read(pathToStaticKey);
	let staticKey = crypto.createPrivateKey({
		key: readStaticKey,
	});
	return staticKey;
}

module.exports.generateRandomId = () => crypto.randomUUID();

module.exports.generateToken = async () => {
	return await new Promise((resolve, reject) => {
		crypto.randomBytes(48, (err, buffer) => { err ? reject(err) : resolve(buffer.toString('hex'))});
	}); 
}

module.exports.generateECDHKeys = () => {
	console.log('~ Start generating ECDH Keys...');
	let keys = crypto.generateKeyPairSync('x25519');
	let exportedPublicKey = keys.publicKey.export({ type: 'spki', format: 'pem' });
	console.log('~ ECDH Keys were generated ✅');
	return { privateKey: keys.privateKey,
		publicKey: exportedPublicKey }
}


module.exports.encryptData = (data, secret) => {
	IV = crypto.randomBytes(16);
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
	console.log('~ Start generating secret...');
	let secret = crypto.diffieHellman({ publicKey: crypto.createPublicKey(publicKey), privateKey: privateKey });
	console.log('~ Secret was generated ✅');
	return secret;
}
