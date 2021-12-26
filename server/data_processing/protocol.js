module.exports.response = (socket, type, data) => {
    let response = {
       header: {
           type: type
       },
       body: {
           data: data
       }
    };
    return socket.encrypt(JSON.stringify(response));
}