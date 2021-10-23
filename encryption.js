let crypto = require('crypto');
let util = require('util');
let fs = require('fs')
let IV;


async function getStaticPubKey(privFileName, pubFileName){
   const readPublicKey = () => util.promisify(fs.readFile)(pubFileName);
   return await readPublicKey();
}

async function getStaticPrivKey(privFileName){
    const readPrivateKey = () => util.promisify(fs.readFile)(privFileName);
    return await readPrivateKey();
 }


module.exports.generateECDHKeys = ()=>{
    console.log('Start generating ECDH Keys...');
    const keys = crypto.generateKeyPairSync('x25519');
    const exportedPublicKey = keys.publicKey.export({type: 'spki', format: 'pem'});
    console.log('ECDH Keys were generated');
    return {
      privateKey: keys.privateKey,
      publicKey: exportedPublicKey
    }
}


module.exports.encryptData = (data, secret)=>{
    IV = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-gcm', secret, IV);
    let encryptedText = cipher.update(data, 'utf8', 'hex');
        encryptedText += cipher.final('hex');
    let authTag = cipher.getAuthTag();
    return { iv: IV, 
             authTag: authTag,
             data: encryptedText
    }
}


module.exports.decryptData = (data, secret, authTag, iv)=>{
   authTag = Buffer.from(authTag), iv = Buffer.from(iv);
   let decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv);
   decipher.setAuthTag(authTag);
   let decrpyted = decipher.update(data, 'hex', 'utf8');
       decrpyted += decipher.final('utf8');
   return decrpyted;
}


module.exports.generateSecret = (verifySignature, pubKey, privKey)=>{
    if(verifySignature){
      console.log('Start generating secret...');
      let secret = crypto.diffieHellman({publicKey : crypto.createPublicKey(pubKey), privateKey: privKey});
      console.log('Secret was generated');
      return secret;
    }else{
      console.log('The secret was not generated because the signature verification was not successful');
      return;
    }
}


module.exports.createSignature = async(data, privFileName)=>{
    console.log('Creating signature...');
    let staticPrivKey = await getStaticPrivKey(privFileName);
    console.log('Signature is created');
    return crypto.sign(null, Buffer.from(data), staticPrivKey)
}

module.exports.verifySignature = async (data, pubKey, signature)=>{
   console.log('Verifying signarute...');
   let staticPublicServerKey = await getStaticPrivKey(pubKey);
   return crypto.verify(null, data, staticPublicServerKey, signature)
}


//console.log(encryptMyText('hello').text);


//let encryptedMessage = encryptMyText('hello');
//console.log(decryptMyText(encryptedMessage.text, encryptedMessage.authTag, iv));