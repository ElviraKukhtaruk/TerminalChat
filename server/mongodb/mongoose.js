let mongoose = require('mongoose');
let config   = require('../conf');

mongoose.connect(`mongodb://${config.DB.user}:${config.DB.password}@${config.DB.host}:${config.DB.port}/chat`);
let db = mongoose.connection;

db.on('error', function(err) {
   	console.error(err);
});

db.once('open', function() {
   	console.log('MongoDB is Connected!');
});
  
module.exports = db;
