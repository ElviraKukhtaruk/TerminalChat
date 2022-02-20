let error = require('./error');

module.exports.sendMessage = async (socket, req, session) => {
    try {
        console.log(req.body);
    } catch(err) {
        error(socket, req, err);
    }
}