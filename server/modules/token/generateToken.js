let crypto = require('crypto');


module.exports = async () => {
    return await new Promise((resolve, reject) => {
        crypto.randomBytes(48, (err, buffer) => { err ? reject(err) : resolve(buffer.toString('hex'))});
    });   
}