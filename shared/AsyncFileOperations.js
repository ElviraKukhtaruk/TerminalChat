let fs = require('fs');
let util = require('util');


module.exports.write = (path, data) => util.promisify(fs.writeFile)(path, data, {flag: 'w'});
module.exports.read = path => util.promisify(fs.readFile)(path, encoding='utf-8');