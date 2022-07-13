let mongoose = require('mongoose');
let config = require('../configuration/mainConfig');

let password = encodeURIComponent(config.DB.password);

mongoose.connect(`mongodb://${config.DB.user}:${password}@${config.DB.host}:${config.DB.port}/chat`, function(err){
	if (err) console.error(err);
});
let db = mongoose.connection;


db.once('open', function() {
	console.log('MongoDB is Connected');
});
  
module.exports = db;
