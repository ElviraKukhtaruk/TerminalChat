let crypto = require('crypto');
let util   = require('util');
let fs     = require('fs')

let IV;


async function getStaticKey(pathToStaticKey){
   let readStaticKey = () => util.promisify(fs.readFile)(pathToStaticKey);
   return await readStaticKey();
 }


module.exports.generateECDHKeys = () => {
   console.log('\n1) Start generating ECDH Keys...');
   let keys = crypto.generateKeyPairSync('x25519');
   let exportedPublicKey = keys.publicKey.export({type: 'spki', format: 'pem'});
   console.log('- ECDH Keys were generated ✅');
   return { privateKey: keys.privateKey,
            publicKey: exportedPublicKey }
}


module.exports.encryptData = (data, secret)=>{
   IV = crypto.randomBytes(16);
   let cipher = crypto.createCipheriv('aes-256-gcm', secret, IV);
   let encryptedData = cipher.update(data, 'utf8', 'hex');
       encryptedData += cipher.final('hex');
   let authTag = cipher.getAuthTag();
   return { iv: IV, 
            authTag: authTag,
            data: encryptedData };
}


module.exports.decryptData = (data, secret, authTag, iv)=>{
   authTag = Buffer.from(authTag), iv = Buffer.from(iv);
   let decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv);
       decipher.setAuthTag(authTag);
   let decrpyted = decipher.update(data, 'hex', 'utf8');
       decrpyted += decipher.final('utf8');
   return decrpyted;
}


module.exports.generateSecret = (signatureVerificationResult, publicKey, privateKey)=>{ 
   if(signatureVerificationResult){
      console.log('4) Start generating secret...');
      let secret = crypto.diffieHellman({publicKey : crypto.createPublicKey(publicKey), privateKey: privateKey});
      console.log('- Secret was generated ✅');
      return secret;
   }else console.log('The secret was not generated because the signature verification was not successful');
}

module.exports.verifySignature = async (data, pathToStaticPublicKey, signature)=>{
   console.log('3) Verifying signarute...');
   let staticPublicKey = await getStaticKey(pathToStaticPublicKey);
   let verify = crypto.verify(null, data, staticPublicKey, signature);
   console.log(`- Signature verification result: ${verify}`);
   return verify;
}