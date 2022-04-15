let mongoose = require('mongoose');
let config = require('../configuration/mainConfig');

mongoose.connect(`mongodb://${config.DB.user}:${config.DB.password}@${config.DB.host}:${config.DB.port}/chat`, function(err){
	if (err) console.error(err);
});
let db = mongoose.connection;


db.once('open', function() {
	console.log('MongoDB is Connected');
});
  
module.exports = db;