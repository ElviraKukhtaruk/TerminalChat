module.exports = (socket, res) => {
    try {
        let requestType = res.header.previousType ? `Request type: ${res.header.previousType}` : '';
        console.log(`Error response: ${res.body.message}. ${requestType}`);
    } catch(err) {
        console.log(`An error occurred while receiving a response from the server, type: ${res.header.type}: ${err}`);
    }
}