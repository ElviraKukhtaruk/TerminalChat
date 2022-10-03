let db = require('../../postgresql/postgresql');
let crypto = require('../../../shared/cryptographic/crypto');

module.exports = async (chat_id) => {
    let newLink = await crypto.generateRandomId(30, 'base64');
    await db.Groups().update({id: chat_id}, {link: newLink});
    return newLink;
}