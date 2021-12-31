let Request       = require('./Request');
let User          = require('../../mongodb/schema'); 
let generateToken = require('../token/generateToken');
let redis         = require('../../redis/setAndGet');

module.exports = () => {
   Request.addRequest('log_in', async (socket, req) => {
      try {
         let user = await User.findOne({username: req.body.username});
         if(user){
            let token = await generateToken();
            redis.set(token, {user_id: user._id, socket_id: socket.id});
            socket.send({header: {type: 'token'}, body: {token: token} });
         }
      } catch(err) {
         console.log(`${socket.remoteAddress} - ${socket.status} - An error occurred while log in: ${err}`);
      }
   });
}