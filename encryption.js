let crypto = require('crypto');
let iv;

let myKeys = crypto.createECDH('secp256k1');
    myKeys.generateKeys();


let otherKeys =  crypto.createECDH('secp256k1');
    otherKeys.generateKeys();

let myPublicKey = myKeys.getPublicKey();
let otherPublicKey = otherKeys.getPublicKey();


let mySecret = myKeys.computeSecret(otherPublicKey);
let otherSecret = otherKeys.computeSecret(myKeys.getPublicKey());

console.log(myKeys);





function encryptMyText(data){
    iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-gcm', mySecret, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
    let authTag = cipher.getAuthTag();
    return {
        iv: iv,
        authTag: authTag,
        text: encrypted
    }
}


function decryptMyText(data, authTag, iv){
   let decipher = crypto.createDecipheriv('aes-256-gcm', otherSecret, iv);
   decipher.setAuthTag(authTag);
   let decrpyted = decipher.update(data, 'hex', 'utf8');
       decrpyted += decipher.final('utf8');
   return decrpyted;
}

//console.log(encryptMyText('hello').text);


//let encryptedMessage = encryptMyText('hello');
//console.log(decryptMyText(encryptedMessage.text, encryptedMessage.authTag, iv));