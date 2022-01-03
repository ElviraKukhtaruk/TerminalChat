let timeFormat = require('../modules/others/timeFormat');

module.exports = (socket, req) => {
   try {
      console.log(`USER ${timeFormat()}> ${req.body.message}`);
   } catch(err) {
      console.log(`${socket.remoteAddress} - ${socket.status} An error occurred while while receiving data, type: ${req.header.type}: ${err}`);
      socket.error('Check the correctness of the sent data', req.header.type);
   }
}


